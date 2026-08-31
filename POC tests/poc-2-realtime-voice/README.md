# POC 2 — Realtime AI Teacher Voice Pipeline

## Run locally

1. Copy `.env.example` to `.env` and add a free-tier Gemini API key from Google AI Studio.
2. Run `npm run dev` in this folder.
3. Open `http://localhost:5175` in **Chrome**, permit microphone use, and ask one of the three specified educational questions.

The key stays on the Node server and is never delivered to the browser.

## Architecture tested

```text
Chrome microphone
  ↓
Web Speech API SpeechRecognition (Chrome recognition service)
  ↓
Node/Express local proxy
  ↓
Gemini Developer API
  ↓
Web Speech API SpeechSynthesis
  ↓
Chrome audio playback
```

This POC intentionally does **not** use Pipecat. It is the fastest useful zero-infrastructure baseline against which Pipecat should be judged.

## Latency definition

| Metric | Measurement |
| --- | --- |
| STT | recognition start → final recognition result |
| Gemini | browser request → Gemini text response |
| TTS | Gemini response → browser speech `onstart` |
| Total | recognition start → browser speech `onstart` |

The displayed total includes student speaking time. For the practical turn-taking figure, note the time between the visible final transcript and the first audible response. The browser API does not expose the exact instant the student stops speaking, so this is an approximation.

## Test script

Run each as a separate turn:

1. “Can you explain Newton's second law?”
2. “I don't understand why mass affects acceleration.”
3. “Can you give me an example?”

For interruption, start a response, click **Start Conversation** (which cancels current TTS), then say: “Wait, what does chlorophyll mean?”

## Research findings

- Pipecat's current JavaScript client uses `@pipecat-ai/client-js` plus `@pipecat-ai/small-webrtc-transport`; SmallWebRTC needs a matching Pipecat server-side transport and is positioned for lightweight/local use. Its browser support is a transport client, not a self-contained server replacement. [Pipecat SmallWebRTC documentation](https://docs.pipecat.ai/api-reference/client/js/transports/small-webrtc)
- Pipecat’s Groq Whisper integration sends completed VAD segments and provides final, not interim, transcripts. It requires a Groq API key. [Pipecat Groq STT documentation](https://docs.pipecat.ai/api-reference/server/services/stt/groq)
- Groq Whisper is fast and multilingual, but it is not a permanently ₹0 component: its published model pricing is usage-based. [Groq Whisper documentation](https://console.groq.com/docs/speech-to-text)
- Gemini offers a free tier with limits, suitable for this POC; free-tier data may be used to improve Google products. [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing)
- Chrome’s `SpeechRecognition` is not portable or reliably offline; Chrome may send speech to its recognition service. Browser `SpeechSynthesis` is the genuinely no-cost temporary TTS. [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## Technologies used

| Component | Version / service |
| --- | --- |
| Runtime | Node.js + TypeScript 5.9.3 |
| Server | Express 5.2.1 |
| Env loading | dotenv 16.6.1 |
| STT | Chrome Web Speech API (`SpeechRecognition`) |
| LLM | Gemini Developer API (`gemini-2.5-flash` default; configurable) |
| TTS | Chrome Web Speech API (`SpeechSynthesis`) |

## Results status

| Component | Result |
| --- | --- |
| Microphone | Ready to test in Chrome |
| STT | Ready to test in Chrome |
| Gemini | Requires the user's free API key |
| TTS | Ready to test in Chrome |
| Realtime transport | Not used in baseline |
| End-to-end | Not yet measured — do not mark PASS until one keyed Chrome run completes |

## Free deployment assessment

| Component | ₹0 option | Requirement / blocker |
| --- | --- | --- |
| Browser UI/STT/TTS | Static hosting | Chrome-dependent STT; native TTS voice quality varies |
| Gemini | Free tier | Quotas and free-tier data-use conditions |
| Current local proxy | Any free Node-compatible host, subject to current free-tier availability | Must keep Gemini key secret; hosts can sleep or change limits |
| Groq Whisper | No durable ₹0 assumption | Usage is priced, even though developer allowances may exist |
| Pipecat + SmallWebRTC | Not a clean ₹0 deployment target | Requires always-reachable Python/WebRTC server, HTTPS, and likely TURN for reliable NAT traversal |

## Recommendation

**RECONSIDER PIPECAT**

For this project stage, Pipecat adds a Python/WebRTC server and transport deployment problem before it solves a demonstrated user problem. First measure this native-browser baseline. Keep Pipecat only if measured latency/turn-taking requires true streaming audio, better VAD, or barge-in beyond what this simple pipeline delivers.
