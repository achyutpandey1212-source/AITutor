import { useEffect, useRef, useState } from 'react'
import { KokoroTTS } from 'kokoro-js'

const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX'
const EXAMPLES = [
  { label: 'English', text: "Hello, I'm your AI teacher. Let's learn something interesting today.", voice: 'af_heart' },
  { label: 'Hindi', text: 'नमस्ते, मैं आपका एआई शिक्षक हूँ। आज हम कुछ नया सीखेंगे।', voice: 'af_heart' },
  { label: 'Hinglish', text: 'Hello! Aaj hum AI ke baare mein kuch interesting seekhenge.', voice: 'af_heart' },
]

function formatMs(ms) {
  if (!Number.isFinite(ms)) return '—'
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`
}

export default function App() {
  const [text, setText] = useState(EXAMPLES[0].text)
  const [voice, setVoice] = useState('af_heart')
  const [status, setStatus] = useState('Ready — model loads on first generation')
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [metrics, setMetrics] = useState({ model: null, synthesis: null, total: null, ram: null })
  const ttsRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }, [audioUrl])

  const getTts = async () => {
    if (ttsRef.current) return ttsRef.current
    const started = performance.now()
    setStatus('Downloading and preparing Kokoro…')
    const tts = await KokoroTTS.from_pretrained(MODEL, {
      dtype: 'q8',
      device: 'wasm',
      progress_callback: (event) => {
        if (event.status === 'progress') setStatus(`Loading model… ${Math.round(event.progress)}%`)
      },
    })
    ttsRef.current = tts
    setMetrics((old) => ({ ...old, model: performance.now() - started }))
    return tts
  }

  const generate = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setAudioUrl((old) => { if (old) URL.revokeObjectURL(old); return null })
    const totalStarted = performance.now()
    try {
      const tts = await getTts()
      setStatus('Creating speech…')
      const synthesisStarted = performance.now()
      const audio = await tts.generate(text.trim(), { voice })
      const blob = audio.toBlob()
      const nextUrl = URL.createObjectURL(blob)
      const memory = performance.memory
      setMetrics((old) => ({
        ...old,
        synthesis: performance.now() - synthesisStarted,
        total: performance.now() - totalStarted,
        ram: memory ? memory.usedJSHeapSize : null,
      }))
      setAudioUrl(nextUrl)
      setStatus('Speech ready')
      requestAnimationFrame(() => audioRef.current?.play().catch(() => {}))
    } catch (error) {
      console.error(error)
      setStatus(`Could not generate speech: ${error.message || 'unknown error'}`)
    } finally { setLoading(false) }
  }

  const chooseExample = (example) => { setText(example.text); setVoice(example.voice); setStatus(`${example.label} sample selected`) }

  return <main>
    <section className="hero">
      <p className="eyebrow">Browser-only proof of concept</p>
      <h1>Kokoro <span>TTS</span></h1>
      <p className="lede">Type a lesson, generate natural speech locally in Chrome, and inspect the practical trade-offs.</p>
    </section>

    <section className="card composer" aria-label="Speech composer">
      <label htmlFor="lesson">What should your AI teacher say?</label>
      <textarea id="lesson" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} />
      <div className="controls">
        <div className="voice-picker"><label htmlFor="voice">Voice</label><select id="voice" value={voice} onChange={(e) => setVoice(e.target.value)}><option value="af_heart">Heart · US English</option><option value="af_bella">Bella · US English</option><option value="am_adam">Adam · US English</option><option value="bf_emma">Emma · British English</option></select></div>
        <button onClick={generate} disabled={loading || !text.trim()}>{loading ? 'Generating…' : 'Generate speech'} <span aria-hidden="true">→</span></button>
      </div>
      <p className="status" role="status"><i className={loading ? 'pulse' : ''}></i>{status}</p>
    </section>

    <section className="result-grid">
      <div className="card audio-card"><p className="section-label">Output</p><div className="speaker">🔊</div>{audioUrl ? <audio ref={audioRef} controls src={audioUrl}>Your browser cannot play this audio.</audio> : <p className="empty">Your generated audio will appear here.</p>}</div>
      <div className="card metrics"><p className="section-label">Browser signal</p><div><span>First model load</span><strong>{formatMs(metrics.model)}</strong></div><div><span>Speech generation</span><strong>{formatMs(metrics.synthesis)}</strong></div><div><span>Total request</span><strong>{formatMs(metrics.total)}</strong></div><div><span>JS heap after run</span><strong>{metrics.ram ? `${(metrics.ram / 1048576).toFixed(0)} MB` : 'Chrome only'}</strong></div><p className="hint">Chrome exposes heap memory via <code>performance.memory</code>; other browsers may not.</p></div>
    </section>

    <section className="test-section"><div><p className="section-label">Quick language checks</p><h2>Try the edge cases.</h2></div><div className="examples">{EXAMPLES.map((example) => <button key={example.label} className="example" onClick={() => chooseExample(example)}><span>{example.label}</span><small>{example.text}</small></button>)}</div></section>

    <section className="notes"><div><b>What this tests</b><p>WebGPU/WASM model loading, audio generation speed, Chrome playback, and visible JavaScript heap use.</p></div><div><b>Important limitation</b><p>Kokoro’s bundled voices are English-focused. Hindi and Hinglish may synthesize, but quality and pronunciation must be judged by ear in this test.</p></div><div><b>Cost model</b><p>No server is used. Model downloads are cached by the browser after the first run; compute happens on the visitor’s device.</p></div></section>
  </main>
}
