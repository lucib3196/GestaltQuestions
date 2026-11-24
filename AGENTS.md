# GestaltQuestions

## Product mission

Build a centralized hub for creating and distributing engineering questions
across disciplines, with a current focus on mechanical engineering, chemical
engineering, and civil engineering.

Users create and run questions built from a question stub and dynamic content
generated with Python or JavaScript. AI agents assist with question generation
and execution workflows.


## Visual evidence for UI changes

- Capture a before screenshot of each affected screen or state before applying
  the approved UI edits. Capture the matching after screenshot once the change
  is running. Use the same viewport, theme, and representative data where
  practical. For a new screen or state, capture the prior entry point.
- If the change affects a user flow, transition, or animation, also record a
  short video or GIF showing the relevant interaction.
- Use the `gestalt-playtest` skill to capture the evidence. In the four-agent
  workflow, have the tester capture the baseline before the implementor
  starts editing and capture the result once the change is running.
- Link the labeled before and after screenshots and any recording in the final
  response. If an artifact could not be captured, state which one and why.

## Coordinating subagents

When the user asks for the four-agent workflow, the main Codex session
coordinates the work:

1. Ask `investigator` to trace the affected code and identify relevant checks.
2. Show the user the proposed code and briefly explain it. Wait for explicit
   approval before editing any files or assigning edits to `implementor`.
3. Give `implementor` the approved proposal and wait for the diff.
4. Ask `tester` and `reviewer` to check the same diff in parallel.
5. Bring findings that require additional edits back to the user with the
   proposed changes. After approval and implementation, rerun affected checks.
6. Summarize what changed, what passed, and what remains unverified.

## Repository map

- `frontend/` contains the React and TypeScript application.
- `backend/` contains the FastAPI application and its tests in `app_test/`.
- `agents/` contains application agent code.
- `code_sandbox/` contains the code execution service.
- `packages/` contains shared Python packages.
- `compose.yaml` defines the local development stack.

## Development and verification

- Start the local stack from the repository root with `docker compose up --build`.
- From `frontend/`, run `npm run lint` and `npm run build` for frontend changes.
- From `backend/`, run `uv run pytest app_test/unit` for backend unit tests
  and `uv run pytest app_test/api` for API tests as relevant.
- Check `.github/workflows/` for test environment and emulator requirements.
- Use the `gestalt-playtest` skill for browser playtests of the local stack.
