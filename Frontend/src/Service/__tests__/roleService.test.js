vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Role Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getRoles consulta el endpoint de roles", async () => {
    const { getRoles } = await import("../roleService");
    const api = (await import("../api")).default;
    const response = { data: [{ id: 1, nombre: "Admin" }] };

    api.get.mockResolvedValue(response);

    await expect(getRoles()).resolves.toBe(response);
    expect(api.get).toHaveBeenCalledWith("/api/roles");
  });

  it("createRole envia los datos al endpoint de roles", async () => {
    const { createRole } = await import("../roleService");
    const api = (await import("../api")).default;
    const roleData = { nombre: "Editor" };
    const response = { data: { id: 2, ...roleData } };

    api.post.mockResolvedValue(response);

    await expect(createRole(roleData)).resolves.toBe(response);
    expect(api.post).toHaveBeenCalledWith("/api/roles", roleData);
  });
});
