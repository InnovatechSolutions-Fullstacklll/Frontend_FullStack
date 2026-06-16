vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Project Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProjects consulta el endpoint de proyectos", async () => {
    const { getProjects } = await import("../projectService");
    const api = (await import("../api")).default;
    const response = { data: [{ id: 1, nombre: "Portal" }] };

    api.get.mockResolvedValue(response);

    await expect(getProjects()).resolves.toBe(response);
    expect(api.get).toHaveBeenCalledWith("/api/projects");
  });

  it("createProject envia los datos al endpoint de proyectos", async () => {
    const { createProject } = await import("../projectService");
    const api = (await import("../api")).default;
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const projectData = { nombre: "Portal", area: "Frontend" };
    const response = { data: { id: 2, ...projectData } };

    api.post.mockResolvedValue(response);

    const result = createProject(projectData);

    expect(result).toBeUndefined();
    expect(api.post).toHaveBeenCalledWith("/api/projects", projectData);
    expect(logSpy).toHaveBeenCalledWith("/api/projects", projectData);

    logSpy.mockRestore();
  });
});
