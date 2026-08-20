<p align="center">
  <img src="public/logo.png" alt="Julir" width="200" />
</p>

<h1 align="center">Julir</h1>

<p align="center">
  An AI voice diary for daily reflections and personal insights.
</p>

<p align="center">
  <img alt="platform" src="https://img.shields.io/badge/platform-Web%20%7C%20iOS-1c1917" />
  <img alt="stack" src="https://img.shields.io/badge/React-19-61dafb" />
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-5-3178c6" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## Demo

[![Watch the demo](https://img.shields.io/badge/▶%20Watch%20the%20demo-YouTube-red?style=for-the-badge)](https://youtube.com/shorts/UOgP1xRdTbw)

## Overview

Julir is a voice-first journaling app. Talk to it like a diary, and it transcribes, replies, and quietly builds a picture of what's on your mind over time. The goal is a journaling habit that takes less effort than opening a notes app.

It runs in the browser and ships as a native iOS app from the same codebase via Capacitor.

## Quick start

Local install, env, test, and production-build steps live in [DEPLOYMENT.md](DEPLOYMENT.md).

```bash
cp .env.example .env.local
npm install
npm run dev
```

The app is at `http://localhost:3000`. Add a Gemini API key in Settings (or leave it blank to use demo replies). See [DEPLOYMENT.md](DEPLOYMENT.md) for tests (`npm test`, `npm run test:coverage`) and production builds.

## Features

- **Voice journaling** — speech-to-text entries with natural pauses handled for you
- **AI reflections** — Gemini-powered responses that read the entry and reply thoughtfully, not generically
- **Personal insights** — the app watches patterns across entries and surfaces what keeps coming up (moods, topics, recurring people)
- **Local-first** — entries live in an on-device SQLite database. Nothing leaves the device except the text sent to Gemini
- **Biometric lock** — Face ID / Touch ID on iOS
- **Text-to-speech** — read entries back aloud
- **PDF export** — save a month or a range as a portable file

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS · Capacitor (iOS) · Google Gemini · SQLite

## Status

Built as a solo project. The web build runs locally, and the iOS build is ready to install through Xcode. It is not on the App Store.

## License

[MIT](LICENSE) © Dongkyu Lee
