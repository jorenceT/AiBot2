# Character AI Companion (Angular + Capacitor)

An Angular mobile-first app where you can:

- Add custom characters (`name`, `voice`, `personality`)
- Keep a default gentle female **AI Assistant**
- Find and add famous characters using **Gemma (`gemma-3-27b-it`)**
- Chat with any selected character using **Gemini 3.1 Flash Live**
- See responses in chat text and optionally hear spoken output
- Mute/unmute speaker while still receiving text
- Remove added characters

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start app:

```bash
npm start
```

3. In the app's top setup panel:
   - Paste Gemini API key from Google AI Studio
   - Keep default discovery model as `gemma-3-27b-it`
   - Keep/default conversation model as `gemini-3.1-flash-live`

## Android build with Capacitor

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Notes

- Voice playback uses browser/device speech synthesis.
- If muted, voice output is disabled but text chat remains available.
