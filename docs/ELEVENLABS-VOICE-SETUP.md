# NW-32 — ElevenLabs SDK and owner voice-clone setup

## Current capability

The project declares the official `@elevenlabs/elevenlabs-js` SDK. `server/elevenlabs-client.ts` exports a lazy client factory protected by `server-only`. Next.js loads `ELEVENLABS_API_KEY` from the private `.env.local` file; the SDK reads it from the environment. This module introduces no browser panel, hosted endpoint, automatic sample upload or narration request.

The owner's requested workflow is to create a clone of their own voice and narrate the capstone. The CLI supports `voices ivc create`; account eligibility, any provider-required verification and a clean recording must be available before enrollment. The owner completed cloning in their own provider account and supplied its ID privately. Requested short clips and the full 508-word capstone narration were then generated successfully. This setup change did not create the provider voice; it is not multi-user enrollment.

## Onboarding and private recordings

1. From the repository root, run `npx -y @elevenlabs/cli@latest onboard init` and follow its account-authorization instructions.
2. Verify configuration with `npx -y @elevenlabs/cli@latest onboard check --answered --env-path .env.local`. Never print the env file, paste keys into chat or commit credentials.
3. Supply a clear recording of the owner's voice with one speaker and no music. One to two minutes is a practical starting point, subject to the provider's current requirements. Raw samples belong outside the repository, or under the ignored `private-voice/` directory.
4. After the owner supplies their sample for cloning, an operator can submit it through the authenticated CLI's `voices ivc create --files <sample path> --name <voice name> --no-retry` operation. Load the private environment for the command; do not put the key in command arguments. Confirm the returned voice ID and any verification requirement. Do not silently repeat an uncertain creation request.
5. Use the confirmed voice for the requested capstone narration once provider access, quota and the generation request are approved. A setup smoke test must not create speech without the user's separate approval. Keep generated audio outside public source control and listen to the full export before using it in the video.

The existing [single-owner narration pilot](VOICE-CLONING-PILOT.md) remains a distinct fixed-text CLI; it does not upload samples or create voices. This setup adds the SDK foundation and documents the newly requested operator enrollment path. It is not multi-creator enrollment or proof of speaker similarity.

## Reuse and boundaries

Server modules may call `createElevenLabsClient()` only behind appropriate access controls and explicit consent. The factory alone is not an authenticated or cost-controlled service. Static GitHub Pages cannot host this server SDK; current Deepgram browser features remain separate. A public creator service requires identities, ownership/permission handling, spending limits, private media storage and revocation/deletion before deployment.

Onboarding and SDK guidance were read from the official [ElevenLabs skills repository](https://github.com/elevenlabs/skills/tree/main/text-to-speech). The creation command was checked using the installed CLI's `voices ivc create --help`. No API key, personal recording or voice ID belongs in this document.

## NW-32 handoff

Scope: official SDK dependency, lazy server-only client, private-recording ignore rule and onboarding guide. Validation: TypeScript checks, six existing offline pilot tests and diff whitespace checks pass; CLI onboarding confirms a working key and SDK declaration/import. The operator generated requested short clips and the full capstone MP3 using the owner's supplied clone, with automatic request retries disabled. Credentials, voice ID and personal audio remain outside committed source. The configured key lacks `voices_read`, so voice metadata/verification status was not independently inspected. Full-export listening and speaker-similarity assessment remain the owner's review; no scored quality claim is made. Independent quality-guardian review was attempted but unavailable due to a model rate limit. PR review remains required before merge/deployment.
