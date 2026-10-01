const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://127.0.0.1:8000"
const API_BASE_URL = import.meta.env.VITE_API_URL ?? `${API_ORIGIN}/api/v1`

async function getJsonFrom<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getJson<T>(path: string): Promise<T> {
  return getJsonFrom<T>(`${API_BASE_URL}${path}`)
}

export function getServerJson<T>(path: string): Promise<T> {
  return getJsonFrom<T>(`${API_ORIGIN}${path}`)
}
