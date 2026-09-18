import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultProgress } from "../core/progress";
import { levelsByDifficulty } from "../data/levels";
import { ResultsScreen } from "./ResultsScreen";

describe("ResultsScreen", () => {
  it("renders the empty-results recovery state", () => {
    render(
      <ResultsScreen
        completedDifficulty="easy"
        completedLevels={[]}
        isNewBestChallengeScore={false}
        onChallenge={vi.fn()}
        onHome={vi.fn()}
        onPracticeAgain={vi.fn()}
        progress={defaultProgress}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /resultados no disponibles/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar reto/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /practicar otra vez/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /volver al inicio/i }),
    ).not.toHaveLength(0);
    expect(screen.queryByText("0/0")).not.toBeInTheDocument();
    expect(screen.queryByText("100%")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /lo que ya dominas/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /laboratorio completado/i }),
    ).not.toBeInTheDocument();
  });

  it("labels the hard-mode educational summary as a challenge", () => {
    render(
      <ResultsScreen
        challengeSummary={{ score: 420, streak: 2 }}
        completedDifficulty="hard"
        completedLevels={Object.values(levelsByDifficulty.hard)}
        isNewBestChallengeScore={false}
        onChallenge={vi.fn()}
        onHome={vi.fn()}
        onPracticeAgain={vi.fn()}
        progress={defaultProgress}
      />,
    );

    expect(
      screen.getByRole("complementary", {
        name: "Resumen educativo del reto",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("complementary", {
        name: "Resumen educativo de la práctica",
      }),
    ).not.toBeInTheDocument();
  });

  it("exposes mastered gates and completed levels as lists", () => {
    render(
      <ResultsScreen
        challengeSummary={{ score: 420, streak: 2 }}
        completedDifficulty="hard"
        completedLevels={Object.values(levelsByDifficulty.hard)}
        isNewBestChallengeScore={false}
        onChallenge={vi.fn()}
        onHome={vi.fn()}
        onPracticeAgain={vi.fn()}
        progress={defaultProgress}
      />,
    );

    const summary = screen.getByRole("complementary", {
      name: "Resumen educativo del reto",
    });
    const masteredGates = within(summary).getByRole("list", {
      name: "Lo que ya dominas",
    });
    const completedLevels = within(summary).getByRole("list", {
      name: "Niveles completados",
    });

    expect(within(masteredGates).getAllByRole("listitem")).toHaveLength(7);
    expect(within(completedLevels).getAllByRole("listitem")).toHaveLength(7);
  });
});
