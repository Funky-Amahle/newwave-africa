# Security Policy

## Supported versions

NewWave Africa is a prototype. Security fixes target the current `main` branch;
older branches and snapshots do not have a separate maintenance commitment.
The GitHub Pages app is a static export. Optional server deployments and
third-party provider accounts have their own configuration and access controls.

## Report a vulnerability privately

Email [xolmzoli@gmail.com](mailto:xolmzoli@gmail.com) with the subject
`NewWave Africa security report`. Do not open a public issue or pull request
containing an exploit, credentials, or private data.

Include:

- The affected component, commit or version, and deployment URL if relevant.
- The expected behavior, observed behavior, and potential impact.
- Minimal reproduction steps using synthetic data and a local environment.
- Redacted logs or screenshots and a way to contact you for clarification.

Do not send working API keys, personal recordings, private stories, or
participant information. If a key has been exposed, revoke or rotate it with
its provider immediately and remove it from public material. Redact sensitive
values before sending a report.

GitHub private vulnerability reporting may also be used if the repository's
[Security page](https://github.com/Funky-Amahle/newwave-africa/security)
offers **Report a vulnerability**. This document does not enable that repository
setting; email is the documented reporting route regardless of its availability.

The maintainer will assess the report, request clarification as needed, and
coordinate a fix and disclosure with the reporter. There is no guaranteed
response time or bounty program. If you have not received an acknowledgement
after seven days, please send a follow-up email. Agree on public disclosure
after the issue has been assessed and affected users have a mitigation.

## Scope and responsible testing

Relevant reports include credential exposure, consent bypasses, unintended
transmission of creator content, unsafe handling of untrusted input, and
vulnerable dependencies affecting this application. Provider outages and
ordinary feature requests belong in the public issue forms when they contain
no sensitive information.

Test locally with your own synthetic data and accounts. Do not access another
person's drafts or credentials, clone a voice without permission, run disruptive
tests against the live app, or test third-party services without authorization.
Report provider-specific vulnerabilities through the provider's own channel.

For harassment or other community conduct concerns, use the reporting procedure
in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
