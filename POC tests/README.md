# Kokoro browser POC

## Run it

```powershell
cd 'C:\Users\Achyut\Desktop\AITutor\POC tests'
npm run dev
```

Open the local address shown in the terminal (usually `http://localhost:5173`) in Chrome.

## What to record

1. Start with a hard-refresh or a new browser profile to measure the first model download and load time.
2. Run each built-in sample: English, Hindi, and Hinglish.
3. Listen for naturalness and pronunciation, particularly with Devanagari Hindi and Romanized Hindi.
4. Record the displayed generation time and JS heap figure after each run.
5. In Chrome DevTools → Performance monitor, also observe total memory while generating.

## Expected outcome / caveat

The app uses `kokoro-js` with Kokoro 82M entirely in the visitor's browser. It makes no application-server call; the first-run model download is cached by the browser. The selected Kokoro model and voices are English-oriented, so Hindi/Hinglish is deliberately included as a quality test, not presented as a supported multilingual feature.

`q8` + WASM is chosen as a broad Chrome-compatible default. It is a practical baseline for this POC; testing WebGPU separately may improve speed on suitable hardware.
