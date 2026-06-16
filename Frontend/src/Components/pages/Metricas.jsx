import { useEffect, useMemo, useState } from "react";
import Navbar from "../Organism/Navbar";
import Footer from "../Organism/Footer";
import Sidebar from "../Organism/Sidebar";
import { createMetric, getMetrics } from "../../Service/metricService";
import "../Style/Metricas.css";

const initialMetric = {
  logrosCompletados: 18,
  objetivosActivos: 7,
  avancePromedio: 72,
  pendientesCriticos: 2,
  objetivosPlanteados: [
    "Finalizar modulo de usuarios",
    "Definir tablero de indicadores",
    "Validar flujo de autenticacion",
  ],
  logrosRecientes: [
    "Cuenta creada y validada correctamente",
    "Primer objetivo mensual completado",
    "Revision de avance semanal registrada",
    "Nuevo indicador agregado al panel",
  ],
  logrosMensuales: [6, 9, 5, 11, 13, 10],
  objetivosMensuales: [8, 10, 8, 12, 15, 13],
};

const emptyMetric = {
  logrosCompletados: "",
  objetivosActivos: "",
  avancePromedio: "",
  pendientesCriticos: "",
  objetivosPlanteados: "",
  logrosRecientes: "",
  logrosMensuales: "",
  objetivosMensuales: "",
};

const months = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function getMetricsFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.metrics)) return data.metrics;
  if (Array.isArray(data?.metricas)) return data.metricas;
  if (Array.isArray(data?.data)) return data.data;
  return null;
}

function parseTextList(value) {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumberList(value) {
  return parseTextList(value)
    .map((item) => Number(item))
    .filter((item) => !Number.isNaN(item));
}

function normalizeMetric(metric) {
  return {
    id: metric.id ?? null,
    logrosCompletados: Number(metric.logrosCompletados ?? 0),
    objetivosActivos: Number(metric.objetivosActivos ?? 0),
    avancePromedio: Number(metric.avancePromedio ?? 0),
    pendientesCriticos: Number(metric.pendientesCriticos ?? 0),
    objetivosPlanteados: Array.isArray(metric.objetivosPlanteados)
      ? metric.objetivosPlanteados
      : parseTextList(metric.objetivosPlanteados || ""),
    logrosRecientes: Array.isArray(metric.logrosRecientes)
      ? metric.logrosRecientes
      : parseTextList(metric.logrosRecientes || ""),
    logrosMensuales: Array.isArray(metric.logrosMensuales)
      ? metric.logrosMensuales.map(Number)
      : parseNumberList(metric.logrosMensuales || ""),
    objetivosMensuales: Array.isArray(metric.objetivosMensuales)
      ? metric.objetivosMensuales.map(Number)
      : parseNumberList(metric.objetivosMensuales || ""),
  };
}

function Metricas() {
  const [metric, setMetric] = useState(initialMetric);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newMetric, setNewMetric] = useState(emptyMetric);

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      try {
        const response = await getMetrics();
        const metrics = getMetricsFromResponse(response.data);

        if (isMounted && metrics?.length) {
          setMetric(normalizeMetric(metrics[metrics.length - 1]));
          setMessage("");
        }
      } catch {
        if (isMounted) {
          setMessage(
            "No se pudieron cargar las metricas desde la API. Se muestran datos locales.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  const kpiData = useMemo(
    () => [
      {
        label: "Logros completados",
        value: String(metric.logrosCompletados),
        detail: "registrados",
      },
      {
        label: "Objetivos activos",
        value: String(metric.objetivosActivos),
        detail: "en seguimiento",
      },
      {
        label: "Avance promedio",
        value: `${metric.avancePromedio}%`,
        detail: "avance general",
      },
      {
        label: "Pendientes criticos",
        value: String(metric.pendientesCriticos),
        detail: "requieren atencion",
      },
    ],
    [metric],
  );

  const monthlyProgress = useMemo(
    () =>
      metric.objetivosMensuales.map((goals, index) => ({
        month: months[index] || `M${index + 1}`,
        completed: Number(metric.logrosMensuales[index] || 0),
        goals: Number(goals || 0),
      })),
    [metric],
  );
  const maxBarValue = Math.max(...monthlyProgress.map((item) => item.goals), 1);
  const progressValue = Math.min(Math.max(metric.avancePromedio, 0), 100);
  const achievementGroups = [
    { name: "Completados", value: progressValue, color: "#8f00ff" },
    {
      name: "En progreso",
      value: Math.max(100 - progressValue - metric.pendientesCriticos, 0),
      color: "#ff7300",
    },
    { name: "Pendientes", value: metric.pendientesCriticos, color: "#6b7cff" },
  ];

  function handleChange(event) {
    const { name, value } = event.target;
    setNewMetric((currentMetric) => ({
      ...currentMetric,
      [name]: value,
    }));
  }

  async function handleCreateMetric(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      logrosCompletados: Number(newMetric.logrosCompletados),
      objetivosActivos: Number(newMetric.objetivosActivos),
      avancePromedio: Number(newMetric.avancePromedio),
      pendientesCriticos: Number(newMetric.pendientesCriticos),
      objetivosPlanteados: parseTextList(newMetric.objetivosPlanteados),
      logrosRecientes: parseTextList(newMetric.logrosRecientes),
      logrosMensuales: parseNumberList(newMetric.logrosMensuales),
      objetivosMensuales: parseNumberList(newMetric.objetivosMensuales),
    };

    try {
      const response = await createMetric(payload);
      setMetric(normalizeMetric(response.data || payload));
      setNewMetric(emptyMetric);
      setIsCreating(false);
      setMessage("Metricas guardadas correctamente.");
    } catch {
      setMessage(
        "No se pudieron guardar las metricas. Revisa la conexion con la API.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="metricas-page">
      <Navbar />

      <div className="metricas-layout">
        <Sidebar />

        <main className="metricas-content">
          <section className="metricas-header">
            <div>
              <p className="metricas-eyebrow">Panel privado</p>
              <h1>Metricas y KPIs</h1>
              <p>
                Revisa los logros completados, objetivos activos y el avance
                general del equipo.
              </p>
            </div>
            <button
              className="metricas-action"
              type="button"
              onClick={() => setIsCreating((currentValue) => !currentValue)}
            >
              {isCreating ? "Cerrar formulario" : "Agregar datos"}
            </button>
          </section>

          {message && <p className="metricas-message">{message}</p>}

          {isCreating && (
            <section
              className="metricas-form-panel"
              aria-label="Agregar metricas"
            >
              <form onSubmit={handleCreateMetric} className="metricas-form">
                <div className="metricas-form-grid">
                  <div className="metricas-form-item">
                    <label htmlFor="logrosCompletados">
                      Logros completados
                    </label>
                    <input
                      id="logrosCompletados"
                      className="metricas-input"
                      min="0"
                      name="logrosCompletados"
                      type="number"
                      value={newMetric.logrosCompletados}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="metricas-form-item">
                    <label htmlFor="objetivosActivos">Objetivos activos</label>
                    <input
                      id="objetivosActivos"
                      className="metricas-input"
                      min="0"
                      name="objetivosActivos"
                      type="number"
                      value={newMetric.objetivosActivos}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="metricas-form-item">
                    <label htmlFor="avancePromedio">Avance promedio</label>
                    <input
                      id="avancePromedio"
                      className="metricas-input"
                      max="100"
                      min="0"
                      name="avancePromedio"
                      type="number"
                      value={newMetric.avancePromedio}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="metricas-form-item">
                    <label htmlFor="pendientesCriticos">
                      Pendientes críticos
                    </label>
                    <input
                      id="pendientesCriticos"
                      className="metricas-input"
                      min="0"
                      name="pendientesCriticos"
                      type="number"
                      value={newMetric.pendientesCriticos}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="metricas-form-group">
                  <div className="metricas-form-item">
                    <label htmlFor="objetivosPlanteados">
                      Objetivos planteados
                    </label>
                    <textarea
                      id="objetivosPlanteados"
                      className="metricas-textarea"
                      name="objetivosPlanteados"
                      value={newMetric.objetivosPlanteados}
                      onChange={handleChange}
                      placeholder="Objetivo 1, Objetivo 2"
                      required
                    />
                  </div>

                  <div className="metricas-form-item">
                    <label htmlFor="logrosRecientes">Logros recientes</label>
                    <textarea
                      id="logrosRecientes"
                      className="metricas-textarea"
                      name="logrosRecientes"
                      value={newMetric.logrosRecientes}
                      onChange={handleChange}
                      placeholder="Logro 1, Logro 2"
                      required
                    />
                  </div>
                </div>

                <div className="metricas-form-grid">
                  <div className="metricas-form-item">
                    <label htmlFor="logrosMensuales">Logros mensuales</label>
                    <input
                      id="logrosMensuales"
                      className="metricas-input"
                      name="logrosMensuales"
                      value={newMetric.logrosMensuales}
                      onChange={handleChange}
                      placeholder="6, 9, 5, 11"
                      required
                    />
                  </div>

                  <div className="metricas-form-item">
                    <label htmlFor="objetivosMensuales">
                      Objetivos mensuales
                    </label>
                    <input
                      id="objetivosMensuales"
                      className="metricas-input"
                      name="objetivosMensuales"
                      value={newMetric.objetivosMensuales}
                      onChange={handleChange}
                      placeholder="8, 10, 8, 12"
                      required
                    />
                  </div>
                </div>

                <button
                  className="metricas-submit-button"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Guardar métricas"}
                </button>
              </form>
            </section>
          )}

          <section className="kpi-grid" aria-label="Resumen de metricas">
            {kpiData.map((item) => (
              <article className="kpi-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.detail}</small>
              </article>
            ))}
          </section>

          <section className="metricas-grid">
            <article className="metricas-panel chart-panel">
              <div className="panel-heading">
                <h2>Avance mensual</h2>
                <span>Logros vs objetivos</span>
              </div>
              <div className="bar-chart" aria-label="Grafico de avance mensual">
                {monthlyProgress.map((item) => (
                  <div className="bar-group" key={item.month}>
                    <div className="bar-stack">
                      <span
                        className="bar bar-goals"
                        style={{
                          height: `${(item.goals / maxBarValue) * 100}%`,
                        }}
                        title={`${item.goals} objetivos`}
                      />
                      <span
                        className="bar bar-completed"
                        style={{
                          height: `${(item.completed / maxBarValue) * 100}%`,
                        }}
                        title={`${item.completed} logros`}
                      />
                    </div>
                    <small>{item.month}</small>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <span>
                  <i className="legend-completed" /> Logros
                </span>
                <span>
                  <i className="legend-goals" /> Objetivos
                </span>
              </div>
            </article>

            <article className="metricas-panel">
              <div className="panel-heading">
                <h2>Estado de logros</h2>
                <span>
                  {isLoading
                    ? "Cargando desde la API..."
                    : "Distribucion actual"}
                </span>
              </div>
              <div className="donut-wrap">
                <div
                  className="donut-chart"
                  style={{ "--metric-progress": `${progressValue}%` }}
                  aria-label="Grafico circular de logros"
                >
                  <strong>{progressValue}%</strong>
                  <small>avance</small>
                </div>
                <div className="donut-list">
                  {achievementGroups.map((group) => (
                    <div className="donut-item" key={group.name}>
                      <span style={{ backgroundColor: group.color }} />
                      <p>{group.name}</p>
                      <strong>{group.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section className="metricas-grid metricas-grid-bottom">
            <article className="metricas-panel objectives-panel">
              <div className="panel-heading">
                <h2>Objetivos planteados</h2>
                <span>Datos conectados a metricas</span>
              </div>
              <div className="objective-list">
                {metric.objetivosPlanteados.map((objective, index) => (
                  <div className="objective-item" key={objective}>
                    <div className="objective-copy">
                      <strong>{objective}</strong>
                      <span>Objetivo activo</span>
                    </div>
                    <div className="progress-track">
                      <span
                        style={{
                          width: `${Math.max(progressValue - index * 8, 10)}%`,
                        }}
                      />
                    </div>
                    <small>{Math.max(progressValue - index * 8, 10)}%</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="metricas-panel achievements-panel">
              <div className="panel-heading">
                <h2>Logros recientes</h2>
                <span>Ultimas completadas</span>
              </div>
              <ul className="achievement-list">
                {metric.logrosRecientes.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </article>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Metricas;
