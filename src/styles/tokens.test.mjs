import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tokenStyles = readFileSync("src/styles/tokens.css", "utf8");

function readHexToken(name) {
  const match = tokenStyles.match(
    new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, "i"),
  );

  if (!match) {
    throw new Error(`Missing hexadecimal token: --${name}`);
  }

  return match[1];
}

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

describe("color tokens", () => {
  it("keeps dim text at WCAG AA contrast against panels", () => {
    expect(
      contrastRatio(readHexToken("color-dim"), readHexToken("color-panel")),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
