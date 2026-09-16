import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("level live status", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("announces one concise atomic practice update", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));

    const status = await screen.findByRole("status");

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-atomic", "true");
    expect(status.textContent).toBe("Entradas A 1, B 0. Salida 0.");
    expect(status.closest("section")).not.toHaveAttribute("aria-live");
    expect(status).not.toHaveTextContent(/regla lógica|pista|filas objetivo/i);

    fireEvent.click(screen.getByRole("button", { name: /entrada b/i }));

    expect(status.textContent).toBe("Entradas A 1, B 1. Salida 1.");
  });

  it("stays silent during challenge input and announces only an incorrect submit", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));

    const inputA = await screen.findByRole("button", { name: /entrada a/i });
    const status = screen.getByRole("status");

    expect(status).toBeEmptyDOMElement();
    expect(screen.getByText("?")).toBeInTheDocument();

    fireEvent.click(inputA);

    expect(status).toBeEmptyDOMElement();
    expect(screen.getByText("?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /enviar respuesta/i }));

    expect(status.textContent).toBe(
      "Respuesta incorrecta. Salida 0. Racha rota. Revisa las entradas y vuelve a enviar.",
    );
    expect(status).not.toHaveTextContent(
      /reto activo|pulso de corrección activo|rama bloquea/i,
    );
  });
});
