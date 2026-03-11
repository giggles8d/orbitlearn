import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function generateWithClaude(prompt: string, maxTokens: number = 4000): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return text
}

export function parseClaudeJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned) as T
}
