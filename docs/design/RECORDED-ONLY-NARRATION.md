# NW-06 / NW-07 - Remove robotic browser narration

## Request and scope
Remove browser-generated robotic voices from story cards. Preserve the fictional story text, author attribution, Deepgram audio generation tooling, creator microphone recording, private drafts and GitHub Pages static export. No existing audio files or videos are deleted.

## Behavior
- Remove the installed-browser-voice selector and all Web Speech playback/fallback calls from StoryCard.
- Only an approved recording referenced by the published narration manifest can enable Listen.
- Missing, invalid or unreachable manifests produce a disabled Narration unavailable control and readable explanation. They do not trigger synthetic speech.
- Playback failures stay silent with an error and allow a recorded-audio retry.
- Preserve pause, resume, stop, one active card at a time and cleanup when a card disappears.
- Use a scoped, wrapping control layout rather than the old voice-selector grid.
- The recordings may still be Deepgram-generated; this change removes the unwanted browser voice, not Deepgram itself. Review quality before publishing any recording.

## Validation performed locally
- Node 22.16.0: `node --experimental-strip-types --test tests/narration.test.mjs` - 12 tests passed.
- `tsc --noEmit --target ES2020 --lib ES2020,DOM --strict lib/narration.ts` - passed for the narration module.
- TypeScript TSX syntax transpilation of StoryCard - passed. This is not a full application typecheck/build.
- Tests use simulated media players; they do not establish audible output, microphone functionality or browser visual quality.
- Full dependency installation/build could not run locally because github.com DNS access failed. Check the new PR's GitHub Actions result separately.

## Release / manual QA gate
Before approved release, test keyboard interaction, focus, screen-reader status announcements, 320/375/768/1440px layouts, 200% zoom, and real MP3 playback with pause/resume/stop. Verify a missing or failed recording never speaks. Existing CI executes the expanded narration tests.

No merge, deployment, paid generation or audio publication is authorized by this change. With no published MP3s, the site will be silent after this change is deployed; it will not manufacture a replacement voice.
