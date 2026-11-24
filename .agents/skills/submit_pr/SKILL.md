---
name: submit-pr
description: Validate completed changes and submit a
  documented draft pull request to GitHub.
---

# Pull Request Submission

## Preconditions

- Work on a dedicated feature branch.
- Never push directly to main.
- Follow AGENTS.md and repository conventions.
- Do not merge pull requests.

## Validation

- Inspect all changed files.
- Verify that changes are relevant to the task.
- Run the required repository checks.
- Check for accidentally included secrets.
- Report failed or skipped checks.


## Showcase

Showcase the changes in a way that is easy to understand for reviewers.
Include screenshots, GIFs, or short videos of the changes this is important for any UI changes, but also for any other changes that are not obvious from the code itself.


## Documentation

Read .github/pull_request_template.md.

Generate a pull request description following
the template.

Include:
- Implementation summary
- Motivation
- Design decisions
- Tests executed and actual results
- Known risks
- Human review focus

## Publishing

- Create a descriptive commit.
- Push the feature branch.
- Create a draft pull request using GitHub CLI.
- Return the pull request URL.

## Restrictions

- Never force push.
- Never merge the pull request.
- Never deploy the application.
- Do not publish if mandatory validation fails.