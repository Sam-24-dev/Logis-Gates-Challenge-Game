import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("mobile challenge submission", () => {
  it("places challenge submission with the circuit before secondary actions", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /iniciar reto/i }));

    const submitRegion = await screen.findByRole("region", {
      name: /envío del reto/i,
    });
    const levelRegion = screen.getByRole("region", {
      name: /reto 1: XOR bajo presión/i,
    });
    const sidePanel = screen.getByRole("complementary", {
      name: /panel del reto/i,
    });

    expect(
      within(submitRegion).getByRole("button", {
        name: /enviar respuesta/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /enviar respuesta/i }),
    ).toHaveLength(1);
    expect(submitRegion.closest(".level-main-panel")).toBe(levelRegion);
    expect(
      submitRegion.compareDocumentPosition(sidePanel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });
});
