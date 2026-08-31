const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const el = (id) => document.getElementById(id);

const status = el('status');
const student = el('student');
const teacher = el('teacher');
const failure = el('failure');
const detail = el('detail');

const buttons = {
  start: el('start'),
  stop: el('stop'),
  mute: el('mute'),
  ask: el('ask')
};

let recognition;
let muted = false;
let speechEnded = false;

// Timestamps: T0..T6
let T0 = 0; // mic recording starts
let T1 = 0; // student stops speaking
let T2 = 0; // final transcript received
let T3 = 0; // Gemini request starts
let T4 = 0; // Gemini response starts (first token)
let T_geminiEnd = 0; // Gemini total completion
let T5 = 0; // TTS starts
let T6 = 0; // First audio audible

const fmt = (ms) => (Number.isFinite(ms) && ms >= 0 ? `${Math.round(ms)} ms` : '—');

const setStatus = (text, active = false) => {
  status.textContent = `${active ? '●' : '○'} ${text}`;
  status.className = active ? 'status live' : 'status';
};

const setFailure = (text = 'None.') => {
  failure.textContent = text;
};

const setButtons = (running) => {
  buttons.start.disabled = running;
  buttons.stop.disabled = !running;
  buttons.mute.disabled = !running;
};

function resetMetrics() {
  ['m_speech', 'm_stt', 'm_ttft', 'm_gemini_total', 'm_tts_first', 'm_post_speech'].forEach((id) => {
    const node = el(id);
    if (node) node.textContent = '—';
  });
  detail.textContent = 'Benchmarking turn...';
}

function updateMetricsDisplay() {
  const speechDur = T1 > 0 && T0 > 0 ? T1 - T0 : 0;
  const sttFinal = T2 > 0 && T1 > 0 ? T2 - T1 : 0;
  const ttft = T4 > 0 && T3 > 0 ? T4 - T3 : 0;
  const geminiTotal = T_geminiEnd > 0 && T3 > 0 ? T_geminiEnd - T3 : (T4 > 0 ? T4 - T3 : 0);
  const ttsFirst = T6 > 0 && T5 > 0 ? T6 - T5 : 0;
  const postSpeechLatency = T6 > 0 && T1 > 0 ? T6 - T1 : 0;

  if (el('m_speech')) el('m_speech').textContent = fmt(speechDur);
  if (el('m_stt')) el('m_stt').textContent = fmt(sttFinal);
  if (el('m_ttft')) el('m_ttft').textContent = fmt(ttft);
  if (el('m_gemini_total')) el('m_gemini_total').textContent = fmt(geminiTotal);
  if (el('m_tts_first')) el('m_tts_first').textContent = fmt(ttsFirst);
  if (el('m_post_speech')) el('m_post_speech').textContent = fmt(postSpeechLatency);

  detail.textContent = `T6 (${Math.round(T6)}) − T1 (${Math.round(T1)}) = Post-speech perceived latency: ${Math.round(postSpeechLatency)} ms`;

  console.table({
    "T0 (Mic Start)": T0,
    "T1 (Speech End)": T1,
    "T2 (Final Transcript)": T2,
    "T3 (Gemini Start)": T3,
    "T4 (Gemini First Token)": T4,
    "Gemini End": T_geminiEnd,
    "T5 (TTS Start)": T5,
    "T6 (First Audio Audible)": T6,
    "Speech duration (T1-T0)": fmt(speechDur),
    "STT finalization (T2-T1)": fmt(sttFinal),
    "Gemini TTFT (T4-T3)": fmt(ttft),
    "Gemini total": fmt(geminiTotal),
    "TTS first audio (T6-T5)": fmt(ttsFirst),
    "POST-SPEECH LATENCY (T6-T1)": fmt(postSpeechLatency)
  });
}

function stopAudio() {
  speechSynthesis.cancel();
}

function speak(answer) {
  if (muted) {
    T6 = performance.now();
    updateMetricsDisplay();
    detail.textContent = 'Muted: text response completed, audio intentionally skipped.';
    setStatus('Ready for next question');
    return;
  }

  T5 = performance.now();
  const utterance = new SpeechSynthesisUtterance(answer);
  utterance.rate = 1.08;
  utterance.pitch = 1.0;

  let audioStarted = false;
  utterance.onstart = () => {
    if (!audioStarted) {
      T6 = performance.now();
      audioStarted = true;
      setStatus('AI Teacher speaking…', true);
      updateMetricsDisplay();
    }
  };

  utterance.onerror = (e) => {
    setFailure(`TTS failure: ${e.error || 'speech synthesis failed'}`);
    setStatus('TTS failed');
  };

  utterance.onend = () => {
    setStatus('Ready for next question');
  };

  speechSynthesis.speak(utterance);
}

async function askTeacher(question) {
  if (!question.trim()) {
    return setFailure('No speech detected. Try again and speak into the microphone.');
  }

  student.textContent = `“${question}”`;
  setStatus('Gemini is thinking…', true);
  teacher.textContent = '“...”';

  T3 = performance.now();
  let firstChunkReceived = false;
  let fullAnswer = '';

  try {
    const response = await fetch('/api/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.error) throw new Error(data.error);

            const token = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (token) {
              if (!firstChunkReceived) {
                T4 = performance.now();
                firstChunkReceived = true;
              }
              fullAnswer += token;
              teacher.textContent = `“${fullAnswer}”`;
            }
          } catch (jsonErr) {
            // Ignore partial SSE JSON formatting errors
          }
        }
      }
    }

    T_geminiEnd = performance.now();
    if (!firstChunkReceived) {
      T4 = T_geminiEnd;
    }

    setStatus('AI Teacher responding…', true);
    speak(fullAnswer.trim());
  } catch (err) {
    setStatus('Gemini unavailable');
    setFailure(`Gemini failure: ${err.message}`);
  }
}

function beginRecognition() {
  if (!Recognition) {
    setStatus('Speech recognition unsupported');
    setFailure('STT unavailable: use Chrome/Edge or use the text fallback.');
    return;
  }

  stopAudio();
  setFailure();
  resetMetrics();

  T0 = 0;
  T1 = 0;
  T2 = 0;
  T3 = 0;
  T4 = 0;
  T5 = 0;
  T6 = 0;
  T_geminiEnd = 0;
  speechEnded = false;

  recognition = new Recognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = true;
  recognition.continuous = false;

  let finalText = '';

  recognition.onstart = () => {
    T0 = performance.now();
    setStatus('Listening… Speak now!', true);
    setButtons(true);
  };

  recognition.onspeechstart = () => {
    setStatus('Speech detected…', true);
  };

  recognition.onspeechend = () => {
    if (!speechEnded) {
      T1 = performance.now();
      speechEnded = true;
      setStatus('Speech ended. Finalizing transcript…', true);
    }
  };

  recognition.onresult = (e) => {
    let live = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const text = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalText += text;
      } else {
        live += text;
      }
    }
    if (live) student.textContent = `“${live}”`;
  };

  recognition.onerror = (e) => {
    setFailure(
      e.error === 'not-allowed'
        ? 'Microphone permission denied. Allow microphone access and retry.'
        : `STT failure: ${e.error}`
    );
    setStatus('Listening failed');
    recognition = undefined;
    setButtons(false);
  };

  recognition.onend = () => {
    setButtons(false);
    T2 = performance.now();
    if (!T1) T1 = T2; // Fallback if onspeechend didn't fire

    if (finalText.trim()) {
      student.textContent = `“${finalText.trim()}”`;
      askTeacher(finalText.trim());
    } else if (failure.textContent === 'None.') {
      setStatus('No speech detected');
      setFailure('No speech detected. Click Start and speak clearly into the microphone.');
    }
    recognition = undefined;
  };

  recognition.start();
}

buttons.start.onclick = beginRecognition;

buttons.stop.onclick = () => {
  if (recognition) {
    if (!speechEnded) {
      T1 = performance.now();
      speechEnded = true;
    }
    recognition.stop();
  }
  stopAudio();
  recognition = undefined;
  setButtons(false);
  setStatus('Stopped');
};

buttons.mute.onclick = () => {
  muted = !muted;
  buttons.mute.textContent = muted ? 'Unmute' : 'Mute';
  if (muted) stopAudio();
};

buttons.ask.onclick = () => {
  resetMetrics();
  const now = performance.now();
  T0 = now;
  T1 = now;
  T2 = now;
  const questionInput = el('question').value || "Can you explain Newton's second law?";
  askTeacher(questionInput);
};

addEventListener('online', () => setFailure());
addEventListener('offline', () => {
  setStatus('Network offline');
  setFailure('Network interruption: reconnect, then retry.');
});

