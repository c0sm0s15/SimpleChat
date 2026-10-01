param(
    [Parameter(Position = 0)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$backendRoot = Join-Path $projectRoot "backend"
$pythonPath = Join-Path $backendRoot ".venv\Scripts\python.exe"
$pidPath = Join-Path $backendRoot ".venv\uvicorn.pid"
$logDirectory = Join-Path $projectRoot "logs"
$stdoutPath = Join-Path $logDirectory "uvicorn.stdout.log"
$stderrPath = Join-Path $logDirectory "uvicorn.stderr.log"
$healthUrl = "http://127.0.0.1:8000/hello"

function Get-ManagedUvicornProcess {
    if (-not (Test-Path $pidPath)) {
        return $null
    }

    $savedPid = 0
    if (-not [int]::TryParse((Get-Content $pidPath -Raw), [ref]$savedPid)) {
        Remove-Item $pidPath -Force
        return $null
    }

    $process = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
    if ($null -eq $process -or $process.Path -ne $pythonPath) {
        Remove-Item $pidPath -Force
        return $null
    }

    return $process
}

function Test-ApiResponding {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -eq 200)
    }
    catch {
        return $false
    }
}

function Start-Uvicorn {
    if (-not (Test-Path $pythonPath)) {
        throw "Project virtual environment not found. Create it first with: uv sync"
    }

    if (Get-ManagedUvicornProcess) {
        Write-Output "Uvicorn is already running (managed by this script)."
        return
    }

    if (Test-ApiResponding) {
        Write-Output "The API already responds at http://127.0.0.1:8000, but this script does not own that server. Stop it in its original terminal first."
        return
    }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

    $process = Start-Process `
        -FilePath $pythonPath `
        -ArgumentList @("-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000") `
        -WorkingDirectory $backendRoot `
        -RedirectStandardOutput $stdoutPath `
        -RedirectStandardError $stderrPath `
        -WindowStyle Hidden `
        -PassThru

    Set-Content -Path $pidPath -Value $process.Id
    Write-Output "Started Uvicorn with --reload (PID $($process.Id))."
    Write-Output "API:  http://127.0.0.1:8000"
    Write-Output "Docs: http://127.0.0.1:8000/docs"
    Write-Output "Logs: $stdoutPath and $stderrPath"
}

function Stop-Uvicorn {
    $process = Get-ManagedUvicornProcess
    if ($null -eq $process) {
        Write-Output "No Uvicorn process managed by this script is running."
        return
    }

    & taskkill.exe /PID $process.Id /T /F | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Could not stop Uvicorn process $($process.Id)."
    }

    Remove-Item $pidPath -Force -ErrorAction SilentlyContinue
    Write-Output "Stopped Uvicorn (PID $($process.Id))."
}

switch ($Action) {
    "start" {
        Start-Uvicorn
    }
    "stop" {
        Stop-Uvicorn
    }
    "restart" {
        Stop-Uvicorn
        Start-Uvicorn
    }
    "status" {
        $process = Get-ManagedUvicornProcess
        if ($null -eq $process) {
            if (Test-ApiResponding) {
                Write-Output "The API responds at http://127.0.0.1:8000, but it is not managed by this script."
            }
            else {
                Write-Output "Uvicorn is stopped."
            }
        }
        elseif (Test-ApiResponding) {
            Write-Output "Uvicorn is running with --reload (PID $($process.Id)); /hello returned HTTP 200."
        }
        else {
            Write-Output "Uvicorn process is running (PID $($process.Id)), but /hello is not responding yet."
        }
    }
}
