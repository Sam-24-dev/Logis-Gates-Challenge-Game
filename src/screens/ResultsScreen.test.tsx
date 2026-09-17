import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultProgress } from "../core/progress";
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
});
