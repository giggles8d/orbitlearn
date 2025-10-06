// Minimal, OpenAI-compatible interface. Use your own provider if preferred.
export async function askTutor(prompt: string, system = 'You are a helpful course tutor.') {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return 'AI not configured. Set OPENAI_API_KEY to enable the tutor.'
  }
  const base = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const res = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    })
  })
  if (!res.ok) {
    return 'AI request failed.'
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
