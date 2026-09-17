import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("navigation semantics", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exposes welcome orientation as stages instead of navigation", () => {
    render(<App />);

    expect(
      screen.queryByRole("navigation", { name: /módulos de la experiencia/i }),
    ).not.toBeInTheDocument();

    const stages = screen.getByRole("list", {
      name: /etapas de la experiencia/i,
    });

    expect(within(stages).getByText("Inicio")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(
      screen.getByRole("button", { name: /empezar/i }),
    ).toBeInTheDocument();
  });

  it("exposes mode orientation as stages instead of navigation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    expect(
      screen.queryByRole("navigation", { name: /mapa de la experiencia/i }),
    ).not.toBeInTheDocument();

    const stages = screen.getByRole("list", {
      name: /etapas del laboratorio/i,
    });

    expect(within(stages).getByText("Modo")).toHaveAttribute(
      "aria-current",
      "step",
    );
    expect(
      screen.getByRole("button", { name: /entrar a práctica/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar reto/i }),
    ).toBeInTheDocument();
  });
});
