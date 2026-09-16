import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexMarkup = readFileSync("index.html", "utf8");
const socialPreviewPath = "public/social-preview.png";
const socialPreviewUrl =
  "https://logis-gates-challenge-game.vercel.app/social-preview.png";

describe("social preview metadata", () => {
  it("uses the raster preview across public metadata", () => {
    expect(indexMarkup).toMatch(
      /property="og:image"\s+content="https:\/\/logis-gates-challenge-game\.vercel\.app\/social-preview\.png"/,
    );
    expect(indexMarkup).toContain(
      '<meta property="og:image:type" content="image/png" />',
    );
    expect(indexMarkup).toMatch(
      /name="twitter:image"\s+content="https:\/\/logis-gates-challenge-game\.vercel\.app\/social-preview\.png"/,
    );
    expect(indexMarkup).toContain(`"image": "${socialPreviewUrl}"`);
    expect(indexMarkup.match(/social-preview\.png/g)).toHaveLength(3);
    expect(indexMarkup).not.toContain("social-preview.svg");
  });

  it("ships a real 1200 by 630 PNG", () => {
    expect(existsSync(socialPreviewPath)).toBe(true);

    const image = readFileSync(socialPreviewPath);

    expect(image.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    expect(image.readUInt32BE(16)).toBe(1200);
    expect(image.readUInt32BE(20)).toBe(630);
  });
});
