# 🚀 Frontend - Aplicación React

Una aplicación web moderna construida con React, Vite y Bootstrap para una experiencia de usuario fluida y responsiva.

## 📋 Tabla de Contenidos

- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📋 Prerrequisitos](#-prerrequisitos)
- [🚀 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🏃‍♂️ Ejecución](#️-ejecución)
- [🧪 Tests](#-tests)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔗 API y Servicios](#-api-y-servicios)
- [📜 Scripts Disponibles](#-scripts-disponibles)
- [🤝 Contribución](#-contribución)

## ✨ Características

- ⚡ **Rendimiento Optimizado**: Construido con Vite para desarrollo rápido y builds optimizados
- 🎨 **UI Moderna**: Interfaz responsiva con Bootstrap y React Bootstrap
- 🔐 **Autenticación**: Sistema de login y registro con JWT
- 🧭 **Navegación**: Routing con React Router DOM
- 🧪 **Testing**: Suite completa de tests con Vitest y Testing Library
- 📱 **Mobile First**: Diseño adaptativo para todos los dispositivos
- 🔧 **Configuración Flexible**: Entornos de desarrollo y producción

## 🛠️ Tecnologías

### Core
- **React 19.2.5** - Framework principal
- **Vite 8.0.10** - Build tool y dev server
- **React Router DOM 7.15.0** - Navegación y routing

### UI & Estilos
- **Bootstrap 5.3.8** - Framework CSS
- **React Bootstrap 2.10.10** - Componentes React para Bootstrap
- **React Bootstrap Icons 1.11.6** - Iconos

### API & Networking
- **Axios 1.16.0** - Cliente HTTP para llamadas API

### Testing
- **Vitest 1.4.1** - Framework de testing
- **@testing-library/react 14.0.0** - Utilidades de testing para React
- **@testing-library/jest-dom 5.16.5** - Matchers adicionales para Jest
- **@testing-library/user-event 14.4.3** - Simulación de eventos de usuario
- **jsdom 21.1.0** - Entorno DOM para tests

### Desarrollo
- **ESLint 10.2.1** - Linting y calidad de código
- **TypeScript Types** - Definiciones de tipos para React

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **npm** (viene incluido con Node.js) o **yarn**
- **Git** - [Descargar](https://git-scm.com/)

### Verificar Instalación

```bash
# Verificar Node.js
node --version
# Debería mostrar v18.x.x o superior

# Verificar npm
npm --version
# Debería mostrar una versión reciente

# Verificar Git
git --version
# Debería mostrar una versión de Git
```

## 🚀 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- **Dependencias de producción**: React, Axios, Bootstrap, etc.
- **Dependencias de desarrollo**: Vite, Vitest, ESLint, etc.

### 2.1 Instalar solo Axios y tests manualmente

Si necesitas instalar solo Axios y las librerías de test manualmente, usa estos comandos:

```bash
npm install axios bootstrap react-bootstrap react-bootstrap-icons react-router-dom react-router-hash-link
```

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 3. Verificar Instalación

```bash
# Verificar que todo esté instalado correctamente
npm list --depth=0
```

## ⚙️ Configuración

### Variables de Entorno

El proyecto utiliza configuración por entorno. Los archivos de configuración están en `src/Service/config.js`:

```javascript
// Configuración de desarrollo
development: {
  API_BASE_URL: 'http://localhost:8080',
}

// Configuración de producción
production: {
  API_BASE_URL: 'https://tu-api-produccion.com',
}
```

### Backend API

Asegúrate de que tu backend esté corriendo en:
- **Desarrollo**: `http://localhost:8080`
- **Producción**: Configura la URL correspondiente en `config.js`

## 🏃‍♂️ Ejecución

### Modo Desarrollo

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:5173` (o el siguiente puerto disponible).

### Build para Producción

```bash
npm run build
```

### Vista Previa del Build

```bash
npm run preview
```

## 🧪 Tests

### Ejecutar Todos los Tests

```bash
npm test
```

### Ejecutar Tests en Modo Watch

```bash
npm test -- --watch
```

### Ejecutar Tests con Cobertura

```bash
npm test -- --coverage
```

### Tests Disponibles

- **Componentes**: Tests de UI con Testing Library
- **Servicios**: Tests de API y autenticación
- **Configuración**: Tests de configuración de entorno

## 📁 Estructura del Proyecto

```
Frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Recursos (imágenes, logos)
│   ├── Components/        # Componentes reutilizables
│   │   ├── Organism/      # Componentes complejos
│   │   └── pages/         # Páginas de la aplicación
│   ├── Service/           # Servicios y configuración API
│   │   ├── __tests__/     # Tests de servicios
│   │   ├── api.js         # Configuración Axios
│   │   ├── authService.js # Servicios de autenticación
│   │   └── config.js      # Configuración de entorno
│   ├── Style/             # Archivos CSS
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── __tests__/         # Tests generales
├── setupTest.js           # Configuración de tests
├── vite.config.js         # Configuración de Vite
├── eslint.config.js       # Configuración de ESLint
└── package.json           # Dependencias y scripts
```

## 🔗 API y Servicios

### Endpoints

- **POST** `/api/login/auth` - Autenticación de usuario
- **POST** `/api/register/user` - Registro de nuevo usuario

### Configuración de API

- **Base URL**: Configurable por entorno
- **Autenticación**: JWT tokens automáticos
- **Manejo de Errores**: Interceptores centralizados
- **Timeout**: 10 segundos por defecto

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Crear build de producción
npm run preview      # Vista previa del build

# Testing
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con reporte de cobertura

# Calidad de Código
npm run lint         # Ejecutar ESLint
```

## 🤝 Contribución

### Flujo de Desarrollo

1. **Crear una rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. **Hacer commits** descriptivos: `git commit -m "feat: agregar nueva funcionalidad"`
3. **Ejecutar tests** antes de push: `npm test`
4. **Hacer linting**: `npm run lint`
5. **Crear Pull Request** con descripción detallada

### Estándares de Código

- Usar ESLint para mantener consistencia
- Escribir tests para nuevas funcionalidades
- Seguir convenciones de nomenclatura de React
- Mantener commits pequeños y descriptivos

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la [documentación de Vite](https://vitejs.dev/)
2. Consulta los [issues del repositorio](https://github.com/tu-repo/issues)
3. Para hablar con los desarrolladores front: [nico.riveraf@duocuc.cl] y [ra.gomezv@duocuc.cl]
4. Para hablar con los desarrolladores del backend:[cc.leiva@duocuc.cl] y [la.fontecilla@duocuc.cl]
3. Revisa la configuración de tu backend API


**¡Feliz coding! 🎉**
