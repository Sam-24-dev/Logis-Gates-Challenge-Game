# Future improvements

The V2 app is deployed. These ideas are optional proposals for a future V3 or portfolio polish pass, not implemented features.

## Recommended priority

| Priority | Improvement | Why it matters |
| --- | --- | --- |
| High | More levels and mixed circuits | Increases learning depth and replay value |
| High | First-time onboarding | Helps users who do not know logic gates yet |
| Medium | Shareable completion card | Makes the product more memorable and portfolio-friendly |
| Medium | Advanced challenge mode | Gives stronger learners a reason to continue |
| Medium | PWA/offline support | Fits the educational use case and improves polish |
| Low | Analytics for learning outcomes | Useful only if privacy-friendly and clearly scoped |

## 1. More educational content

Add more practice and challenge levels without changing the core architecture.

Good candidates:

- multi-gate AND/OR combinations
- NOT chains
- XOR/XNOR comparison levels
- NAND/NOR as universal-gate lessons
- mixed circuits with 3–4 inputs
- final review circuit using several gates

Acceptance criteria:

- New levels are declarative in `src/data/levels.ts`.
- Truth tables still generate automatically.
- Practice feedback stays understandable.
- Challenge mode remains fast and not overwhelming.

## 2. First-time onboarding

Add a short optional tutorial before the first level.

Suggested flow:

1. What is a binary input?
2. What does a gate do?
3. What does output `1` or `0` mean?
4. Try toggling A/B once before starting level 1.

Keep it skippable. The app should remain fast for returning users.

## 3. Shareable achievement card

After completing practice or challenge mode, generate a small visual summary:

- completed mode
- score
- best streak
- gates mastered
- date

This could start as a static results card in the UI. A future version could export it as an image.

## 4. Advanced challenge mode

Create a second challenge path for users who already understand the basics.

Possible rules:

- less guidance
- harder target outputs
- fewer retries
- bonus for solving without toggling unnecessary inputs
- circuits with deeper nesting

## 5. PWA/offline support

Because this is an educational app, offline practice makes sense.

Scope:

- service worker
- installable manifest polish
- cache app shell and fonts
- clear update behavior after deploys

Do this only after verifying it does not complicate Vercel deployment or stale cache behavior.

## 6. Accessibility deep pass with assistive tech

The historical [Phase 10 QA report](./phase10-final-qa-report.md) recorded Lighthouse accessibility 100 on a local preview of a production build, not a WCAG or assistive-technology certification. A future deep pass could include:

- keyboard-only playthrough on every mode
- screen reader smoke test
- reduced-motion playthrough
- high zoom check at 200% and 400%
- color contrast review on every feedback state

## 7. Performance micro-optimizations

Further performance work is optional and should be driven by reproducible measurements on the target devices:

- reduce render-blocking CSS further with route-specific CSS or critical CSS
- reduce unused initial JavaScript beyond the current lazy chunks
- audit CSS selector/layout cost on very low-end devices

Do not over-optimize unless real devices show issues.

## Not recommended for V2

Avoid these unless the product direction changes:

- backend accounts
- online leaderboard
- multiplayer
- Three.js as the core circuit renderer
- heavy UI frameworks that replace the custom visual identity
- analytics that track students without a clear privacy story
