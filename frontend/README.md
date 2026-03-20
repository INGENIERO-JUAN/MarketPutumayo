# MarketPutumayo - Frontend

Plataforma de comercio electrónico para productores y compradores del departamento del Putumayo, Colombia.

## 🚀 Tecnologías utilizadas

- React 18
- Vite
- React Router DOM
- Axios

## 📋 Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Backend de MarketPutumayo corriendo en el puerto 4000

## ⚙️ Instalación

```bash
npm install
```

## ▶️ Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Estructura del proyecto

```
src/
├── api/          # Configuración de Axios
├── components/   # Componentes reutilizables (Navbar)
├── context/      # Contexto global de autenticación
└── pages/        # Páginas de la aplicación
    ├── Login.jsx
    ├── Registro.jsx
    ├── Catalogo.jsx
    ├── Carrito.jsx
    └── Admin.jsx
```

## 👥 Roles de usuario

- **ADMIN** - Gestiona usuarios, productos y pedidos
- **PRODUCTOR** - Publica y gestiona sus productos
- **COMPRADOR** - Explora el catálogo y realiza pedidos
