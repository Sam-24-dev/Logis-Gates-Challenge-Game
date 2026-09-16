import { Buffer } from "node:buffer";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexMarkup = readFileSync("index.html", "utf8");
const manifestRaw = readFileSync("public/site.webmanifest", "utf8");
const manifest = JSON.parse(manifestRaw);

const pngOk = (path, width, height) => {
  expect(existsSync(path), `${path} must exist`).toBe(true);
  const buf = readFileSync(path);
  expect(
    buf.subarray(0, 8),
    `${path} must start with PNG signature`,
  ).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(buf.readUInt32BE(16), `${path} width must be ${width}`).toBe(width);
  expect(buf.readUInt32BE(20), `${path} height must be ${height}`).toBe(height);
};

describe("PWA icon manifest", () => {
  it("has separate any and maskable icon entries", () => {
    const icons = manifest.icons ?? [];

    expect(icons.some((ic) => ic.purpose === "any"), "needs an any entry").toBe(true);
    expect(icons.some((ic) => ic.purpose === "maskable"), "needs a maskable entry").toBe(true);
    expect(
      icons.every((ic) => !ic.purpose?.includes(" ")),
      "no entry should combine purposes in one string",
    ).toBe(true);
  });

  it("ships real 192x192 and 512x512 PNG icons", () => {
    pngOk("public/icon-192.png", 192, 192);
    pngOk("public/icon-512.png", 512, 512);
  });
});

describe("apple-touch-icon", () => {
  it("declares apple-touch-icon in HTML", () => {
    expect(indexMarkup).toMatch(/rel="apple-touch-icon"/);
    expect(indexMarkup).toMatch(/href="\/icon-192\.png"/);
    expect(indexMarkup).not.toContain("any maskable");
  });
});
