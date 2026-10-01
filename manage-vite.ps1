param(
    [Parameter(Position = 0)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "status"
)

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$frontendRoot = Join-Path $projectRoot "frontend"
$viteCliPath = Join-Path $frontendRoot "node_modules\vite\bin\vite.js"
$pidPath = Join-Path $projectRoot "logs\vite.pid"
$logDirectory = Join-Path $projectRoot "logs"
$stdoutPath = Join-Path $logDirectory "vite.stdout.log"
$stderrPath = Join-Path $logDirectory "vite.stderr.log"
$url = "http://127.0.0.1:5173/"

function Get-ManagedViteProcess {
    if (-not (Test-Path $pidPath)) {
        return $null
    }

    $savedPid = 0
    if (-not [int]::TryParse((Get-Content $pidPath -Raw), [ref]$savedPid)) {
        Remove-Item $pidPath -Force
        return $null
    }

    $process = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
    if ($null -eq $process -or $process.Path -ne $nodePath) {
        Remove-Item $pidPath -Force
        return $null
    }

    return $process
}

function Test-ViteResponding {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -eq 200)
    }
    catch {
        return $false
    }
}

function Start-Vite {
    if (-not $nodePath) {
        throw "Node.js was not found on PATH. Install Node.js, reopen PowerShell, and try again."
    }

    if (-not (Test-Path $viteCliPath)) {
        throw "Vite dependencies were not found. Install them first with: npm --prefix frontend install"
    }

    if (Get-ManagedViteProcess) {
        Write-Output "Vite is already running (managed by this script)."
        return
    }

    if (Test-ViteResponding) {
        Write-Output "A frontend already responds at $url, but this script does not own that server. Stop it in its original terminal first."
        return
    }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

    $quotedViteCliPath = '"{0}"' -f $viteCliPath
    $process = Start-Process `
        -FilePath $nodePath `
        -ArgumentList @($quotedViteCliPath, "--host", "127.0.0.1", "--port", "5173", "--strictPort") `
        -WorkingDirectory $frontendRoot `
        -RedirectStandardOutput $stdoutPath `
        -RedirectStandardError $stderrPath `
        -WindowStyle Hidden `
        -PassThru

    Set-Content -Path $pidPath -Value $process.Id
    Start-Sleep -Milliseconds 800

    if ($process.HasExited) {
        Remove-Item $pidPath -Force -ErrorAction SilentlyContinue
        throw "Vite exited during startup. Check $stderrPath for details."
    }

    Write-Output "Started Vite dev server with hot reload (PID $($process.Id))."
    Write-Output "URL:  $url"
    Write-Output "Logs: $stdoutPath and $stderrPath"
}

function Stop-Vite {
    $process = Get-ManagedViteProcess
    if ($null -eq $process) {
        Write-Output "No Vite process managed by this script is running."
        return
    }

    Stop-Process -Id $process.Id -Force -ErrorAction Stop

    Remove-Item $pidPath -Force -ErrorAction SilentlyContinue
    Write-Output "Stopped Vite (PID $($process.Id))."
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }

switch ($Action) {
    "start" {
        Start-Vite
    }
    "stop" {
        Stop-Vite
    }
    "restart" {
        Stop-Vite
        Start-Vite
    }
    "status" {
        $process = Get-ManagedViteProcess
        if ($null -eq $process) {
            if (Test-ViteResponding) {
                Write-Output "A frontend responds at $url, but it is not managed by this script."
            }
            else {
                Write-Output "Vite is stopped."
            }
        }
        elseif (Test-ViteResponding) {
            Write-Output "Vite is running with hot reload (PID $($process.Id)); the frontend returned HTTP 200 at $url."
        }
        else {
            Write-Output "Vite process is running (PID $($process.Id)), but the frontend is not responding yet."
        }
    }
}
