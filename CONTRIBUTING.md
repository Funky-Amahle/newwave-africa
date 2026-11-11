# Contributing to NewWave Africa

Help emerging African storytellers shape and share their work while preserving
their authorship. Contributions can improve documentation, accessibility,
language accuracy, discovery, or creator tools. Read the [README](README.md) for
the current prototype's capabilities and limitations, and follow our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Choose a contribution

Use a [bug report or feature request](https://github.com/Funky-Amahle/newwave-africa/issues/new/choose)
for public discussions. Check existing issues and pull requests first. For a
large change, discuss the problem and proposed scope before implementing it.
Useful reports explain who benefits, the expected behavior, and how it can be
verified. Documentation corrections can go directly into a small pull request.

Report vulnerabilities privately using [SECURITY.md](SECURITY.md). Send conduct
concerns to [xolmzoli@gmail.com](mailto:xolmzoli@gmail.com), rather than a public
issue. Never attach keys, personal recordings, private stories, or participant
data to public discussions.

## Run the project

Use Node.js 22 or newer. Fork the repository, clone your fork, and create a
feature branch. From the repository root:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. You can work on the core prototype and run offline
checks without provider credentials. If your work needs a provider, keep its
restricted key in the appropriate private environment or session panel; never
commit `.env.local` or place secrets in client code.

## Make and verify a focused change

Read [AGENTS.md](AGENTS.md), identify or propose a task in
[docs/PLAN.md](docs/PLAN.md), and check the relevant role skill under
`.agents/skills/`. These instructions also apply when using Codex. Record which
planning, implementation, review, and documentation steps Codex helped with;
check its output yourself.

For code changes, run:

```sh
npm run typecheck
GITHUB_PAGES=true npm run build
node scripts/check_pages_routes.mjs
```

Run the relevant existing offline tests with
`node --experimental-strip-types --test tests/<relevant-test>.test.mjs`.
The [Pages workflow](.github/workflows/deploy-pages.yml) lists the required CI
checks. If server behavior changes, also check the server build with
`GITHUB_PAGES=false npm run build`. Use synthetic test data and avoid paid
provider requests unless they are needed and explicitly authorized.

For interface changes, review keyboard navigation, narrow screens, zoom,
reduced motion, empty/error states, and playback or microphone behavior where
applicable. Follow the [design quality gate](docs/design/DESIGN-QUALITY-GATE.md).
Record checks you could not perform; a passing build does not establish browser
or pronunciation quality. For documentation-only changes, check links and
content; an application rebuild is usually unnecessary.

## Respect creators and local context

Keep fictional examples and illustrative metrics clearly labelled. Do not treat
Africa as a single culture or claim language quality without local review.
Obtain permission for stories, images, music, recordings, and voice cloning.
Discuss rights and license terms before contributing creative assets. Do not
upload personal samples, API keys, or private research material.

Original project code and documentation are covered by the [MIT License](LICENSE),
except material with its own license notice, such as the Code of Conduct.
By contributing code or documentation, you confirm that you have the rights to
offer it under the applicable project license. Third-party work retains its
own notices and license. Contributing software does not grant permission to use
someone's personal story, likeness, recording, or voice clone.

## Open a pull request

Target `main` and use the existing [PR template](.github/PULL_REQUEST_TEMPLATE.md).
Describe the problem, resulting behavior, task ID, changed scope, checks actually
run, and remaining limitations. Update affected documentation. Maintainers may
ask for revisions before approving the change. Human approval is required before
merging or deploying; contributors and automated agents must not bypass that
gate. See [the handoff template](docs/AGENT-HANDOFF.md) when transferring work.
