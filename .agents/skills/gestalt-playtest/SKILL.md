---
name: gestalt-playtest
description: Use the local GestaltQuestions build in a browser to explore features, verify workflows, and document bugs during a playtest.
---

# GestaltQuestions playtest

## Prepare and verify access

1. Confirm the frontend and backend use the local Compose stack. The default
   URLs are `http://localhost:5173` and `http://localhost:8000`. Check for the
   emulator banner in the UI and verify that `FIREBASE_AUTH_EMULATOR_HOST` is
   set in the Compose backend before creating or modifying an account.
2. For developer sessions, reuse an existing signed-in playtest session or
   look for `/tmp/gestalt-playtest-account-*.json`. Each file contains `email`
   and `password`, and its filename includes the backend user ID. Read the
   values directly into the login automation. Keep credentials out of command
   output, screenshots, reports, and the repository. `/tmp` can be cleared
   between sessions.
3. If no usable account exists, generate a unique test email and password.
   Send `POST /users/` to the local backend with a `user` object containing
   `first_name`, `last_name`, `username`, `email`, and `password`. Save the
   returned internal `id` and write the credentials to
   `/tmp/gestalt-playtest-account-<id>.json` with mode `0600`. Use the signup
   UI when signup itself is in scope. A successful signup can create an
   account even if browser tooling fails to capture its response.
4. To grant developer access to that disposable account, send
   `POST /users/{id}/roles` with `{"role":"developer"}`. Verify that the
   response includes `developer` in `roles`. Sign in through `/login` or
   reload an existing signed-in session, then confirm that `/question_builder`
   renders Developer Workspace. The signed-in `GET /users/` response can
   help diagnose role or identity mismatches.
5. Use the available browser tools for the playtest. On the local Linux host,
   headless Chromium and ChromeDriver worked using the binaries under
   `/snap/chromium/current/usr/lib/chromium-browser/`. Use a separate browser
   session when checking signed-out behavior. Save screenshots to `/tmp` or
   the artifact location requested for the session.

## Playtest the build

- Use the browser as the main way to exercise the app. Follow the current
  session's goals. For an open-ended session, sample a variety of available
  workflows and follow promising issues far enough to reproduce them.
- Create representative test data as needed within the session's scope.
  Give new records a `Playtest` prefix so they are easy to identify. Use the
  API for account setup and diagnostics. Verify user-facing behavior in the UI.
- Check important state transitions, including whether changes survive reload
  and whether signed-out or other role-specific views behave as expected when
  relevant to the session.
- Capture screenshots of useful states and failures. Report what worked,
  what failed, and what was blocked. For bugs, include reproduction steps,
  expected and actual behavior, and relevant browser or API evidence. List
  test records left behind.

## Capture evidence for a UI change

1. Open the affected route and reproduce the relevant state in the baseline
   build. Save the screenshot as `<screen-or-state>-before.png` and note the
   route, viewport, and test data needed to recreate it.
2. Open the updated build with the same setup and capture
   `<screen-or-state>-after.png`. Capture additional pairs when distinct states
   changed, such as an empty view and a populated view.
3. For a flow or animation, use browser video or screen recording to capture
   the updated interaction from just before the triggering action through the
   final visible state. Save it as a short MP4, WebM, or GIF. Verify that the
   clip plays and shows the complete interaction.
4. Save the artifacts in the session's artifact location, or in a dedicated
   directory under `/tmp` for local runs. Use disposable test data and check
   that the captures contain no credentials. Provide links to the files with
   a brief caption identifying the change.
