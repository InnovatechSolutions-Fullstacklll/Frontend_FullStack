vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("Metric Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMetrics consulta el endpoint de metricas", async () => {
    const { getMetrics } = await import("../metricService");
    const api = (await import("../api")).default;
    const response = { data: [{ id: 1, avancePromedio: 80 }] };

    api.get.mockResolvedValue(response);

    await expect(getMetrics()).resolves.toBe(response);
    expect(api.get).toHaveBeenCalledWith("/api/metrics");
  });

  it("createMetric envia los datos al endpoint de metricas", async () => {
    const { createMetric } = await import("../metricService");
    const api = (await import("../api")).default;
    const metricData = { logrosCompletados: 4, avancePromedio: 60 };
    const response = { data: { id: 2, ...metricData } };

    api.post.mockResolvedValue(response);

    await expect(createMetric(metricData)).resolves.toBe(response);
    expect(api.post).toHaveBeenCalledWith("/api/metrics", metricData);
  });
});
