/// <reference types="vite/client" />

import { afterEach, describe, expect, it } from "vitest";
import baseStyles from "./base.css?inline";

describe("base focus styles", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("keeps programmatic heading targets visibly outlined", () => {
    const style = document.createElement("style");
    style.textContent = baseStyles;
    document.head.append(style);

    const heading = document.createElement("h1");
    heading.tabIndex = -1;
    document.body.append(heading);
    heading.focus();

    expect(heading).toHaveFocus();
    expect(getComputedStyle(heading).outlineStyle).toBe("solid");
    expect(getComputedStyle(heading).outlineWidth).toBe("3px");
  });
});
