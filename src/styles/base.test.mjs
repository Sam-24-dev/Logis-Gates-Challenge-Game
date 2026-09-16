import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexMarkup = readFileSync("index.html", "utf8");
const baseStyles = readFileSync("src/styles/base.css", "utf8");
const layoutStyles = readFileSync("src/styles/layout.css", "utf8");
const componentStyles = readFileSync("src/styles/components.css", "utf8");

describe("base focus styles", () => {
  it("keeps programmatic heading targets visibly outlined", () => {
    expect(baseStyles).toMatch(
      /h1\[tabindex="-1"\]:focus\s*\{\s*outline:\s*3px solid var\(--color-warm\);\s*outline-offset:\s*4px;\s*\}/,
    );
    expect(baseStyles).not.toMatch(
      /h1:focus\s*\{\s*outline:\s*none;/,
    );
  });
});

describe("safe-area layout", () => {
  it("opts into edge-to-edge layout with fallback-safe viewport values", () => {
    expect(indexMarkup).toMatch(
      /name="viewport"\s+content="[^"]*viewport-fit=cover[^"]*"/,
    );

    for (const edge of ["top", "right", "bottom", "left"]) {
      expect(baseStyles).toContain(
        `--safe-area-${edge}: env(safe-area-inset-${edge}, 0px);`,
      );
    }

    expect(baseStyles).toMatch(
      /body\s*\{[^}]*min-height:\s*100vh;[^}]*min-height:\s*100dvh;/s,
    );
    expect(baseStyles).toMatch(
      /\.skip-link\s*\{[^}]*top:\s*max\([^;]*var\(--safe-area-top\)[^;]*\);[^}]*left:\s*max\([^;]*var\(--safe-area-left\)[^;]*\);/s,
    );
  });

  it("keeps every full-screen surface inside the safe area", () => {
    expect(layoutStyles).toMatch(
      /\.app-shell\s*\{[^}]*min-height:\s*100vh;[^}]*min-height:\s*100dvh;[^}]*padding:[^}]*var\(--safe-area-top\)[^}]*var\(--safe-area-right\)[^}]*var\(--safe-area-bottom\)[^}]*var\(--safe-area-left\)/s,
    );

    for (const selector of [
      "welcome-shell",
      "mode-shell",
      "mode-shell-inner",
      "level-screen-shell",
      "results-screen-shell",
    ]) {
      expect(componentStyles).toMatch(
        new RegExp(
          `\\.${selector}\\s*\\{[^}]*min-height:\\s*100vh;[^}]*min-height:\\s*100dvh;`,
          "s",
        ),
      );
    }

    for (const edge of ["top", "right", "bottom", "left"]) {
      expect(componentStyles).toContain(`var(--safe-area-${edge})`);
    }

    expect(componentStyles).toMatch(
      /\.welcome-topbar\s*\{[^}]*var\(--safe-area-top\)[^}]*var\(--safe-area-right\)[^}]*var\(--safe-area-left\)/s,
    );
    expect(componentStyles).toMatch(
      /\.welcome-hero\s*\{[^}]*100dvh[^}]*var\(--safe-area-right\)[^}]*var\(--safe-area-bottom\)[^}]*var\(--safe-area-left\)/s,
    );
    expect(componentStyles).not.toMatch(
      /@media[^{}]*\{[^{}]*\.(?:welcome-topbar|welcome-hero|mode-shell-inner|level-screen-shell|results-screen-shell)\s*\{[^}]*padding(?:-inline|-block)?:/s,
    );
  });
});
