/// <reference types="vite/client" />

// @ts-expect-error -- Vitest runs in Node, but this browser app omits Node types.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import rawTokensCss from "./tokens.css?raw";

const tokensCss =
  rawTokensCss || readFileSync("src/styles/tokens.css", "utf8");

describe("typography tokens", () => {
  it("disables synthetic font faces", () => {
    expect(tokensCss).toContain("font-synthesis: none;");
  });
});
