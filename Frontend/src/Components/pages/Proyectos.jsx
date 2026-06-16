import { useEffect, useMemo, useState } from "react";
import Navbar from "../Organism/Navbar";
import Footer from "../Organism/Footer";
import Sidebar from "../Organism/Sidebar";
import { createProject, getProjects } from "../../Service/projectService";
import { isAuthenticated } from "../../Service/authService";
import "../Style/Proyectos.css";

const initialProjects = [
  {
    name: "Panel de Metricas",
    people: 5,
    technology: ["React", "Vite", "CSS"],
    status: "En progreso",
    area: "Frontend",
  },
  {
    name: "Autenticacion de Usuarios",
    people: 3,
    technology: ["Node.js", "Express", "JWT"],
    status: "Revision",
    area: "Backend",
  },
  {
    name: "Dashboard Administrativo",
    people: 7,
    technology: ["React", "Axios", "Bootstrap"],
    status: "Planificado",
    area: "Producto",
  },
  {
    name: "API de Reportes",
    people: 4,
    technology: ["Java", "Spring Boot", "MySQL"],
    status: "En progreso",
    area: "Backend",
  },
  {
    name: "Portal de Clientes",
    people: 6,
    technology: ["React", "Firebase", "CSS"],
    status: "Activo",
    area: "Full Stack",
  },
];

const emptyProject = {
  name: "",
  people: "",
  technology: "",
  area: "",
  status: "Planificado",
};

function getProjectsFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.projects)) return data.projects;
  if (Array.isArray(data?.proyectos)) return data.proyectos;
  if (Array.isArray(data?.data)) return data.data;
  return null;
}

function normalizeProject(project) {
  const tecnologia =
    project.technology ?? project.tecnologia ?? project.tecnologias;

  return {
    id: project.id ?? null,
    name: project.name || project.nombre || "",
    people: (function () {
      const p = Number(
        project.people ?? project.integrantes ?? project.personas ?? 0,
      );
      return Number.isFinite(p) ? p : 0;
    })(),
    technology: Array.isArray(tecnologia)
      ? tecnologia
      : String(tecnologia || "")
          .split(",")
          .map((technology) => technology.trim())
          .filter(Boolean),
    status: project.status || project.estado || "Planificado",
    area: project.area || "",
  };
}

function Proyectos() {
  const [projects, setProjects] = useState(initialProjects);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [newProject, setNewProject] = useState(emptyProject);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        const response = await getProjects();
        const apiProjects = getProjectsFromResponse(response.data);

        if (isMounted && apiProjects) {
          setProjects(apiProjects.map(normalizeProject));
          setMessage("");
        }
      } catch {
        if (isMounted) {
          setMessage(
            "No se pudieron cargar los proyectos desde la API. Se muestran datos locales.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPeople = useMemo(
    () =>
      projects.reduce(
        (total, project) => total + Number(project.people || 0),
        0,
      ),
    [projects],
  );
  const uniqueTechnologies = useMemo(
    () =>
      new Set(
        projects.reduce(
          (technologies, project) => technologies.concat(project.technology),
          [],
        ),
      ),
    [projects],
  );
  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.status === "Activo" || project.status === "En progreso",
      ).length,
    [projects],
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setNewProject((currentProject) => ({
      ...currentProject,
      [name]: value,
    }));
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      nombre: newProject.name.trim(),
      area: newProject.area.trim(),
      estado: newProject.status,
      // Enviar como JSON string en lugar de array
      tecnologia: JSON.stringify(
        String(newProject.technology)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
      integrantes: [Number(newProject.people)],
    };

    if (!isAuthenticated()) {
      setMessage(
        "Debes iniciar sesión para crear proyectos. Ve al login antes de continuar.",
      );
      setIsSaving(false);
      return;
    }

    try {
      console.log("Creating project payload:", payload);
      const response = await createProject(payload);
      console.log("Create project response:", response);
      const responseData = response?.data ?? response;
      const createdProject = normalizeProject(
        responseData?.project || responseData || payload,
      );

      setProjects((currentProjects) => [createdProject, ...currentProjects]);
      setNewProject(emptyProject);
      setIsCreating(false);
      setMessage("Proyecto creado correctamente.");
    } catch (error) {
      console.error("Error creando proyecto:", error);
      console.log("Error response body:", error.response?.data);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.statusText ||
        error.message ||
        "Error desconocido";

      const statusCode = error.response?.status;
      const statusText = statusCode ? ` (${statusCode})` : "";

      setMessage(
        `No se pudo crear el proyecto${statusText}. ${backendMessage}. Revisa la conexión con la API y tu autenticación.`,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="projects-page">
      <Navbar />

      <div className="projects-layout">
        <Sidebar />

        <main className="projects-content">
          <section className="projects-header">
            <div>
              <p className="projects-eyebrow">Gestion interna</p>
              <h1>Proyectos</h1>
              <p>
                Revisa los proyectos activos, la cantidad de personas asignadas
                y las tecnologias principales que se estan usando.
              </p>
            </div>
            <button
              className="project-create-button"
              type="button"
              onClick={() => setIsCreating((currentValue) => !currentValue)}
            >
              {isCreating ? "Cerrar formulario" : "Nuevo proyecto"}
            </button>
          </section>

          {message && <p className="projects-message">{message}</p>}

          {isCreating && (
            <section
              className="project-form-panel"
              aria-label="Crear nuevo proyecto"
            >
              <form onSubmit={handleCreateProject}>
                <label>
                  Nombre del proyecto
                  <input
                    name="name"
                    value={newProject.name}
                    onChange={handleChange}
                    placeholder="Portal de soporte"
                    required
                  />
                </label>

                <label>
                  Personas asignadas
                  <input
                    min="1"
                    name="people"
                    type="number"
                    value={newProject.people}
                    onChange={handleChange}
                    placeholder="4"
                    required
                  />
                </label>

                <label>
                  Tecnologias
                  <input
                    name="technology"
                    value={newProject.technology}
                    onChange={handleChange}
                    placeholder="React, Node.js, MySQL"
                    required
                  />
                </label>

                <label>
                  Area
                  <input
                    name="area"
                    value={newProject.area}
                    onChange={handleChange}
                    placeholder="Full Stack"
                    required
                  />
                </label>

                <label>
                  Estado
                  <select
                    name="status"
                    value={newProject.status}
                    onChange={handleChange}
                  >
                    <option>Planificado</option>
                    <option>En progreso</option>
                    <option>Revision</option>
                    <option>Activo</option>
                    <option>Finalizado</option>
                  </select>
                </label>

                <button
                  className="project-submit-button"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Guardando..." : "Crear proyecto"}
                </button>
              </form>
            </section>
          )}

          <section
            className="projects-summary"
            aria-label="Resumen de proyectos"
          >
            <article>
              <span>Proyectos registrados</span>
              <strong>{projects.length}</strong>
            </article>
            <article>
              <span>Personas asignadas</span>
              <strong>{totalPeople}</strong>
            </article>
            <article>
              <span>Tecnologias usadas</span>
              <strong>{uniqueTechnologies.size}</strong>
            </article>
            <article>
              <span>Proyectos activos</span>
              <strong>{activeProjects}</strong>
            </article>
          </section>

          <section className="projects-panel">
            <div className="projects-panel-heading">
              <h2>Listado de proyectos</h2>
              <span>
                {isLoading
                  ? "Cargando datos desde la API..."
                  : "Datos sincronizados con la API"}
              </span>
            </div>

            <div className="projects-table-wrap">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Personas</th>
                    <th>Tecnologias</th>
                    <th>Area</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id ?? project.name}>
                      <td>
                        <strong>{project.name}</strong>
                      </td>
                      <td>{project.people}</td>
                      <td>
                        <div className="technology-list">
                          {project.technology.map((technology) => (
                            <span key={technology}>{technology}</span>
                          ))}
                        </div>
                      </td>
                      <td>{project.area}</td>
                      <td>
                        <span className="project-status">{project.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Proyectos;
