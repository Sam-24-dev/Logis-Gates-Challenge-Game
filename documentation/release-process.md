# Release process

This repository uses **Release Please** to automate GitHub releases from Conventional Commit messages.

## How it works

1. A normal feature/fix PR is merged into `main`.
2. The `release-please` GitHub Action reads commit messages on `main`.
3. Release Please opens or updates a **Release PR** with:
   - version bumps in `package.json`, `package-lock.json`, and `.release-please-manifest.json`
   - generated release notes in `CHANGELOG.md`
4. After the Release PR is merged, a subsequent Release Please run can create a component-prefixed tag and GitHub Release. This workflow does not run `npm publish`.

Release Please does **not** publish a new release for every merge immediately. It keeps a release PR ready, then the maintainer decides when to merge that release PR.

## Commit message rules

Use Conventional Commits so Release Please can choose the correct semantic version bump.

| Commit type | Version effect | Example |
| --- | --- | --- |
| `fix:` | Patch release | `fix: keep challenge score after reload` |
| `feat:` | Minor release | `feat: add onboarding tutorial` |
| `perf:` | Patch release | `perf: reduce initial bundle size` |
| `docs:` | Usually no release unless configured as releasable | `docs: add roadmap` |
| `chore:` | Usually no release | `chore: update tooling` |
| `feat!:` or `BREAKING CHANGE:` | Major release | `feat!: redesign level data format` |

## Repository setup

Release Please is configured by:

- `.github/workflows/release-please.yml`
- `release-please-config.json`
- `.release-please-manifest.json`

The recorded version lives in [`.release-please-manifest.json`](../.release-please-manifest.json). Check [GitHub Releases](https://github.com/Sam-24-dev/Logis-Gates-Challenge-Game/releases) and tags for the latest published version. For example, [2.1.1](https://github.com/Sam-24-dev/Logis-Gates-Challenge-Game/releases/tag/logic-gates-challenge-game-v2.1.1) was published on 2026-09-27 as `logic-gates-challenge-game-v2.1.1`.

The configured bootstrap commit `30fd0486735147121317cdceb7fa2c19c4e726c7` is the historical V2 baseline, not the current version. Tags use the component prefix `logic-gates-challenge-game-vX.Y.Z` (see `include-v-in-tag` in `release-please-config.json`).

## If release automation fails

The [release workflow](../.github/workflows/release-please.yml) requests `contents: write`, `issues: write`, and `pull-requests: write` for its job. Inspect the run logs, effective permissions, and relevant GitHub Actions settings before changing anything; do not recommend repository-wide write access by default.

Release PRs created or updated with `GITHUB_TOKEN` may need maintainer approval before their CI runs, and token-created events do not necessarily trigger other workflows. Check the actual required `quality` check rather than bypassing it or adding a PAT/App by default. See [GitHub token permissions](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token) and [Release Please Action](https://github.com/googleapis/release-please-action#other-actions-on-release-please-prs).

## Maintainer checklist

Before merging a Release PR:

- [ ] Review the generated diff, proposed version, and notes against the current manifest and published releases.
- [ ] Confirm the branch is up to date with `main` and the required `quality` check has completed successfully.

After merging:

- [ ] Confirm the push CI and Release Please workflow results on the new `main` commit.
- [ ] Confirm the prefixed tag targets the intended commit and the GitHub Release was actually published.
- [ ] If Vercel deploys automatically, check Production and the canonical domain separately from the GitHub Release.

## Example flow

A `feat:` commit such as `feat: add onboarding tutorial` may lead to a minor Release PR; a `fix:` commit such as `fix: correct XNOR challenge feedback` may lead to a patch Release PR. Merging either change does not publish a new release immediately: the maintainer reviews and merges the generated Release PR separately, then verifies its automated outcomes above.
