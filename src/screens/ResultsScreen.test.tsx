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

  it("shows the completed practice route once, followed by real practice metrics and actions", () => {
    const onChallenge = vi.fn();
    const onHome = vi.fn();
    const onPracticeAgain = vi.fn();
    const levels = Object.values(levelsByDifficulty.easy);
    render(
      <ResultsScreen
        completedDifficulty="easy"
        completedLevels={levels}
        isNewBestChallengeScore={false}
        onChallenge={onChallenge}
        onHome={onHome}
        onPracticeAgain={onPracticeAgain}
        progress={defaultProgress}
      />,
    );

    const route = screen.getByRole("region", { name: "Ruta completada" });
    expect(within(route).getByText(`${levels.length}/${levels.length}`)).toBeInTheDocument();
    expect(within(route).getByText("niveles completados")).toBeInTheDocument();
    expect(route.querySelectorAll(".results-route-mark")).toHaveLength(levels.length);
    expect(route.querySelector(".results-route-path")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Compuertas")).toBeInTheDocument();
    expect(screen.queryByText("Niveles", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Niveles completados" })).not.toBeInTheDocument();
    const learned = screen.getByRole("list", { name: "Lo que ya dominas" });
    expect(within(learned).getAllByRole("listitem")).toHaveLength(7);
    screen.getByRole("button", { name: "Iniciar reto" }).click();
    screen.getByRole("button", { name: "Practicar otra vez" }).click();
    screen.getAllByRole("button", { name: "Volver al inicio" })[1].click();
    expect(onChallenge).toHaveBeenCalledOnce();
    expect(onPracticeAgain).toHaveBeenCalledOnce();
    expect(onHome).toHaveBeenCalledOnce();
  });

  it("keeps challenge score, streak and record separate from the shared route", () => {
    const levels = Object.values(levelsByDifficulty.hard);
    render(
      <ResultsScreen
        challengeSummary={{ score: 420, streak: 2 }}
        completedDifficulty="hard"
        completedLevels={levels}
        isNewBestChallengeScore={false}
        onChallenge={vi.fn()}
        onHome={vi.fn()}
        onPracticeAgain={vi.fn()}
        progress={{ ...defaultProgress, bestChallengeScore: 630 }}
      />,
    );

    const route = screen.getByRole("region", { name: "Ruta completada" });
    expect(within(route).getByText(`${levels.length}/${levels.length}`)).toBeInTheDocument();
    expect(route.querySelectorAll(".results-route-mark")).toHaveLength(levels.length);
    expect(screen.getByText("Puntos").parentElement).toHaveTextContent("420");
    expect(screen.getByText("Mejor racha").parentElement).toHaveTextContent("x2");
    expect(screen.getByText("Mejor marca").parentElement).toHaveTextContent("630");
    expect(screen.getByText(/tu mejor carrera sigue en 630 puntos/i)).toBeInTheDocument();
    expect(screen.queryByText("Niveles", { exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Niveles completados" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Lo que ya dominas" })).getAllByRole("listitem")).toHaveLength(7);
  });

  it("derives route marks and readout from the provided levels rather than seven fixed marks", () => {
    const levels = Object.values(levelsByDifficulty.easy).slice(0, 3);
    render(
      <ResultsScreen
        completedDifficulty="easy"
        completedLevels={levels}
        isNewBestChallengeScore={false}
        onChallenge={vi.fn()}
        onHome={vi.fn()}
        onPracticeAgain={vi.fn()}
        progress={defaultProgress}
      />,
    );
    const route = screen.getByRole("region", { name: "Ruta completada" });
    expect(within(route).getByText("3/3")).toBeInTheDocument();
    expect(route.querySelectorAll(".results-route-mark")).toHaveLength(3);
  });
});
