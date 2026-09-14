import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const baseStyles = readFileSync("src/styles/base.css", "utf8");

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
