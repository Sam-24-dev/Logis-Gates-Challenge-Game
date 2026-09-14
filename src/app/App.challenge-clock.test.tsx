import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const levelScreenGate = vi.hoisted(() => {
  let release: (() => void) | undefined;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });

  return {
    open() {
      release?.();
    },
    wait,
  };
});

vi.mock("../screens/LevelScreen", async () => {
  await levelScreenGate.wait;
  return vi.importActual<typeof import("../screens/LevelScreen")>(
    "../screens/LevelScreen",
  );
});

import { App } from "./App";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("starts the challenge clock when the level becomes interactive and samples elapsed time on submit", async () => {
  let now = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
  fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));
  expect(screen.getByText(/cargando laboratorio/i)).toBeInTheDocument();

  now = 6000;
  await act(async () => {
    levelScreenGate.open();
  });
  const heading = await screen.findByRole("heading", {
    name: /reto 1: XOR bajo presión/i,
  });
  await waitFor(() => expect(heading).toHaveFocus());

  now = 11000;
  fireEvent.click(screen.getByRole("button", { name: /entrada a/i }));
  fireEvent.click(screen.getByRole("button", { name: /entrada c/i }));
  fireEvent.click(screen.getByRole("button", { name: /enviar respuesta/i }));

  expect(await screen.findByText(/\+1450 puntos/i)).toBeInTheDocument();
});
