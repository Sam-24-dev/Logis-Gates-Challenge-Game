import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const levelScreenLoader = vi.hoisted(() => ({ attempts: 0 }));

vi.mock("../screens/LevelScreen", async () => {
  levelScreenLoader.attempts += 1;

  if (levelScreenLoader.attempts === 1) {
    throw new Error("level chunk unavailable");
  }

  return vi.importActual<typeof import("../screens/LevelScreen")>(
    "../screens/LevelScreen",
  );
});

import { App } from "./App";
import { retryLazyImport } from "./retryLazyImport";

beforeEach(() => {
  levelScreenLoader.attempts = 0;
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("cache-busts a browser-cached chunk failure on retry", async () => {
  const chunkUrl = `${window.location.origin}/assets/LevelScreen.js`;
  const cachedFailure = new TypeError(
    `Failed to fetch dynamically imported module: ${chunkUrl}`,
  );
  const retryImport = vi.fn().mockResolvedValue({ value: "loaded" });

  await expect(
    retryLazyImport<{ value: string }>(
      () => Promise.reject(cachedFailure),
      2,
      retryImport,
    ),
  ).resolves.toEqual({ value: "loaded" });
  expect(retryImport).toHaveBeenCalledWith(`${chunkUrl}#retry=2`);
});

it("recovers a failed lazy screen and focuses its heading after retry", async () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
  fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));

  const errorHeading = await screen.findByRole("heading", {
    name: /no pudimos cargar esta pantalla/i,
  });
  await waitFor(() => expect(errorHeading).toHaveFocus());

  fireEvent.click(screen.getByRole("button", { name: /reintentar/i }));

  const levelHeading = await screen.findByRole("heading", {
    name: /reto 1: XOR bajo presión/i,
  });
  await waitFor(() => expect(levelHeading).toHaveFocus());
  expect(levelScreenLoader.attempts).toBe(2);
});
