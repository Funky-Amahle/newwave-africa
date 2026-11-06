# Voice and motion implementation

- Story cards use browser SpeechSynthesis; voice support/accents vary. Controls play, pause/resume and stop, and cleanup cancels narration on unmount.
- Voice Studio requests microphone permission on demand, uses MediaRecorder and Web Audio AnalyserNode to display activity, and offers preview, download and discard. Recordings are not uploaded or persisted. The download filename is generic; the actual media codec/container depends on the browser.
- Hero and story cards use Motion for React with reduced-motion preferences; waveform CSS transitions are also disabled under prefers-reduced-motion.
- GitHub Pages remains static; no secrets or server APIs. Verify on Chrome, Safari and Firefox, especially microphone permissions, audio codec, TTS availability, keyboard operation, and mobile sizing.
- Pending manual review: screen reader announcement of recording states, audio playback exclusivity across cards, and contrast on all interactive states.
