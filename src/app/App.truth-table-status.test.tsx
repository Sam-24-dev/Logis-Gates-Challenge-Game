import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("practice truth-table status", () => {
  it("labels current and target rows without relying on color", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /empezar/i }));
    fireEvent.click(screen.getByRole("button", { name: /entrar a práctica/i }));

    const table = await screen.findByRole("table", {
      name: /tabla de verdad/i,
    });

    expect(
      within(table).getAllByRole("columnheader", { name: /estado/i }),
    ).toHaveLength(1);
    expect(
      within(table).getByRole("row", { name: /1 0 0 actual/i }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("row", { name: /1 1 1 objetivo/i }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("row", { name: /^0 0 0$/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /entrada b/i }));

    expect(
      within(table).getByRole("row", {
        name: /1 1 1 actual y objetivo/i,
      }),
    ).toBeInTheDocument();
  });
});
