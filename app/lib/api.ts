const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetcher(path: string) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function triggerPipeline() {
  const res = await fetch(`${API_URL}/api/pipeline/trigger`, { method: 'POST' })
  return res.json()
}

export async function triggerCollection() {
  const res = await fetch(`${API_URL}/api/pipeline/collect`, { method: 'POST' })
  return res.json()
}
