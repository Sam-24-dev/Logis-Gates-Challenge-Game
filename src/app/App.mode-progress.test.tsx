import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultProgress,
  progressStorageKey,
} from "../core/progress";
import { App } from "./App";

describe("mode progress map", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("exposes empty route progress with native semantics", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    const progressMap = screen.getByLabelText(
      /mapa de progreso del laboratorio/i,
    );

    expect(within(progressMap).getByText("0/2")).toBeInTheDocument();
    expect(within(progressMap).getAllByText("Sin iniciar")).toHaveLength(2);

    const practice = within(progressMap).getByRole("progressbar", {
      name: /progreso de práctica/i,
    });
    const challenge = within(progressMap).getByRole("progressbar", {
      name: /progreso de reto/i,
    });

    expect(practice).toHaveAttribute("value", "0");
    expect(practice).toHaveAttribute("max", "7");
    expect(challenge).toHaveAttribute("value", "0");
    expect(challenge).toHaveAttribute("max", "7");
  });

  it("derives partial and completed routes from stored progress", () => {
    window.localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        ...defaultProgress,
        practiceCompletedLevels: 3,
        challengeCompletedLevels: 7,
      }),
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));

    const progressMap = screen.getByLabelText(
      /mapa de progreso del laboratorio/i,
    );
    const practice = within(progressMap).getByRole("progressbar", {
      name: /progreso de práctica/i,
    });
    const challenge = within(progressMap).getByRole("progressbar", {
      name: /progreso de reto/i,
    });

    expect(within(progressMap).getByText("1/2")).toBeInTheDocument();
    expect(practice).toHaveAttribute("value", "3");
    expect(practice).toHaveAttribute("max", "7");
    expect(challenge).toHaveAttribute("value", "7");
    expect(challenge).toHaveAttribute("max", "7");
    expect(within(progressMap).getByText("En progreso")).toBeInTheDocument();
    expect(within(progressMap).getByText("Completada")).toBeInTheDocument();
    expect(within(progressMap).getByText("Tus récords")).toBeInTheDocument();
  });
});
