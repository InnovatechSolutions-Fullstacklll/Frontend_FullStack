import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Proyectos from "./Proyectos";
import * as projectService from "../../Service/projectService";

vi.mock("../../Service/projectService", () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
}));

describe("Proyectos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectService.getProjects.mockResolvedValue({ data: [] });
  });

  it("muestra el resumen principal de proyectos", () => {
    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>,
    );

    const summary = screen.getByLabelText("Resumen de proyectos");

    expect(
      screen.getByRole("heading", { level: 1, name: /Proyectos/i }),
    ).toBeInTheDocument();
    expect(
      within(summary).getByText(/Proyectos registrados/i),
    ).toBeInTheDocument();
    expect(
      within(summary).getByText(/Personas asignadas/i),
    ).toBeInTheDocument();
    expect(
      within(summary).getByText(/Tecnologias usadas/i),
    ).toBeInTheDocument();
  });

  it("muestra nombre, cantidad de personas y tecnologias de cada proyecto", () => {
    projectService.getProjects.mockRejectedValue(
      new Error("API no disponible"),
    );

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>,
    );

    const row = screen.getByRole("row", { name: /Panel de Metricas/i });

    expect(within(row).getByText("Panel de Metricas")).toBeInTheDocument();
    expect(within(row).getByText("5")).toBeInTheDocument();
    expect(within(row).getByText("React")).toBeInTheDocument();
    expect(within(row).getByText("Vite")).toBeInTheDocument();
    expect(within(row).getByText("CSS")).toBeInTheDocument();
  });

  it("crea un nuevo proyecto con los datos del formulario", async () => {
    const user = userEvent.setup();
    projectService.createProject.mockResolvedValue({
      data: {
        name: "Portal de soporte",
        people: 4,
        technology: ["React", "Node.js"],
        area: "Full Stack",
        status: "Activo",
      },
    });

    render(
      <MemoryRouter>
        <Proyectos />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Nuevo proyecto/i }));
    await user.type(
      screen.getByLabelText(/Nombre del proyecto/i),
      "Portal de soporte",
    );
    await user.type(screen.getByLabelText(/Personas asignadas/i), "4");
    await user.type(screen.getByLabelText(/Tecnologias/i), "React, Node.js");
    await user.type(screen.getByLabelText(/Area/i), "Full Stack");
    await user.selectOptions(screen.getByLabelText(/Estado/i), "Activo");
    await user.click(screen.getByRole("button", { name: /Crear proyecto/i }));

    await waitFor(() => {
      expect(projectService.createProject).toHaveBeenCalledWith({
        nombre: "Portal de soporte",
        area: "Full Stack",
        estado: "Activo",
        tecnologia: ["React", "Node.js"],
        integrantes: 4,
      });
    });

    expect(await screen.findByText("Portal de soporte")).toBeInTheDocument();
  });
});
