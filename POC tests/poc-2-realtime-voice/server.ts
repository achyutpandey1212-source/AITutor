import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express(), root = path.dirname(fileURLToPath(import.meta.url)), port = Number(process.env.PORT ?? 5175)
app.use(express.json({ limit: '64kb' }))
app.use(express.static(path.join(root, 'public')))

const instruction = "You are a friendly Class 9 science teacher. The student asks: Can you explain Newton's second law? Give a concise 2–3 sentence explanation suitable for a beginner."

app.post('/api/teacher', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : ''
  if (!question) return res.status(400).json({ error: 'Please provide a question.' })
  const key = process.env.GEMINI_API_KEY
  if (!key || key === 'replace_me') return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env, then restart.' })
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash'

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } }
      })
    })

    if (!response.ok || !response.body) {
      const errText = await response.text()
      res.write(`data: ${JSON.stringify({ error: errText || 'Gemini streaming request failed.' })}\n\n`)
      return res.end()
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      res.write(chunk)
    }

    res.end()
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Gemini request failed.' })}\n\n`)
    res.end()
  }
})

app.listen(port, () => console.log(`POC 2 ready at http://localhost:${port}`))

