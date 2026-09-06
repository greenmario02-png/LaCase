# LaCase — Marketplace Multi-Vendor

Marketplace multi-vendedor con catálogo unificado, comparación de precios entre tiendas,
cálculo de envío por ubicación, subastas estilo eBay, chat en tiempo real, sistema de comisiones
y panel de administración completo.

## Demo desplegada

| App | URL |
|---|---|
| Web | https://lacase-frontend.onrender.com |
| API | https://lacase-backend.onrender.com/api |
| Base de datos | PostgreSQL administrado en Supabase |
| App móvil (Android) | [`LaCase.apk`](./LaCase.apk) — ver [instalación](#app-móvil-apk) |

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express + TypeScript + Prisma ORM |
| Base de datos | PostgreSQL (Supabase) |
| Frontend | React 19 + TypeScript + Vite + MUI 6 + Zustand + Recharts |
| App móvil | Expo (React Native) + TypeScript |
| Tiempo real | Socket.IO (chat, subastas, notificaciones) |
| Validación | Zod (backend y formularios) |
| Hosting | Render (API + sitio estático) · Supabase (base de datos) |
| Calidad | ESLint + Prettier + Jest + Vitest + GitHub Actions CI |

## Funcionalidades principales

### Compras
- **Catálogo multi-vendedor**: productos de todas las tiendas con búsqueda global, filtros
  avanzados (categoría, departamento, tipo de entrega, permuta, marca, precio) e infinite scroll
- **Carrito agrupado por tienda** con merge de carrito guest tras login
- **Checkout atómico** con envío calculado por código postal y pago por **QR**
- **Arma tu PC**: configurador de 8 slots con compatibilidad y calculadora

### Vendedores
- Onboarding con aprobación de admin (país, departamento, categoría de tienda, celular)
- Dashboard con gráficos de ventas, productos CRUD con **atributos dinámicos** (EAV),
  gestión de pedidos y verificación de comprobantes de pago
- **Comisiones de plataforma** configurable (%, mínimo, fijo, sobre envío) con neto por orden

### Subastas (estilo eBay)
- **Proxy bidding** (la oferta es un máximo), **precio de reserva**, **Buy It Now**,
  **anti-sniping** (extiende el tiempo), incremento dinámico por rango, watchlist

### Comunicación
- **Chat comprador↔vendedor** en tiempo real (Socket.IO) con badge de no leídos
- **Notificaciones por rol** con campana global, historial persistente y navegación directa

### Administración (10 módulos)
Dashboard con gráficos Recharts · moderación de productos · gestión de vendedores y usuarios ·
categorías con editor de imágenes · banners con recorte · promociones con selector tienda→producto ·
reportes económicos · contenido del sitio · moneda (Bs base, USD con tasa actualizable)

## Arquitectura

```
LaCase/
  backend/
    src/
      config/      # env (validado con Zod), database, socket, cors
      controllers/ # Capa HTTP
      services/    # Lógica de negocio (comisiones, subastas, notificaciones...)
      middlewares/ # auth, roles, validación Zod, errores, rate limit, helmet
      routes/      # Definición de endpoints REST
      schemas/     # Schemas Zod de validación
      utils/       # errores, logger, paginación, envío, JWT
    prisma/        # Schema + seed
    tests/         # tests unitarios, de integración y E2E
  frontend/
    src/
      components/  # UI reutilizable (ProductCard, ImageCrop, ErrorBoundary...)
      pages/       # páginas públicas, cuenta, vendedor, admin
      services/    # API client con interceptores, Socket.IO
      stores/      # Zustand (auth, cart, theme, currency, filters...)
      hooks/       # useMoney, useAuth...
      types/       # Tipos de dominio compartidos
  mobile/
    src/           # App Expo (React Native) — reutiliza los mismos patrones que el frontend
    android/       # Proyecto nativo Android (para generar el APK)
  .github/workflows/  # CI (lint + typecheck + test + build)
  render.yaml         # Blueprint de despliegue en Render
  docker-compose.yml
  LaCase.apk          # APK release, listo para instalar
```

## Despliegue en producción

- **Backend**: Render (Web Service) — Node.js + Prisma, conectado a Supabase mediante
  `DATABASE_URL`. Definido en [`render.yaml`](./render.yaml).
- **Frontend**: Render (Static Site), compilado con `VITE_API_URL`/`VITE_SOCKET_URL` apuntando
  al backend en Render.
- **Base de datos**: proyecto PostgreSQL en Supabase, sincronizado con `npx prisma db push` y
  poblado con `prisma/seed.ts`.
- **App móvil**: el APK release incluido apunta directamente al backend desplegado en Render
  (sin necesidad de levantar nada localmente).

## Instalación y ejecución local

### 1. Base de datos

```bash
createdb pctienda
```

### 2. Backend

```bash
cd backend
cp .env.example .env    # Editar credenciales si es necesario
npm install
npx prisma db push       # Crear tablas
npx tsx prisma/seed.ts   # Poblar con datos de prueba
npm run dev              # API + WebSocket en :3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # SPA en :5173
```

### 4. App móvil

```bash
cd mobile
npm install
npm start                # Expo — escaneá el QR con Expo Go, o "a" para emulador Android
```

### 5. (Opcional) Docker

```bash
docker compose up -d
```

## Credenciales de prueba

| Rol | Email | Password |
|---|---|---|
| Admin | admin@pctienda.com | admin123 |
| Vendedor | Will.Homenick@hotmail.com | password123 |
| Cliente | buyer.chat@mail.com | password123 |

## Comandos de calidad

```bash
# Backend (cd backend)
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Tests unitarios + integración + E2E
npm run test:coverage # Cobertura
npm run format        # Prettier

# Frontend (cd frontend)
npm run lint
npm run typecheck
npm run build
npm test              # Vitest

# Mobile (cd mobile)
npm test              # Jest
```

## App móvil (APK)

El archivo [`LaCase.apk`](./LaCase.apk), en la raíz del repositorio, es un **build Release**
firmado, listo para instalar en cualquier dispositivo Android sin pasar por ningún store. Ya
viene apuntando al backend desplegado en Render, así que funciona de forma independiente,
sin depender de que el proyecto esté corriendo en una PC local.

Para instalarlo:

1. Descargá `LaCase.apk` al dispositivo Android.
2. Habilitá la instalación de "orígenes desconocidos" / "apps de fuentes externas" para el
   instalador que uses (Chrome, Archivos, etc.) cuando el sistema lo pida.
3. Abrí el APK descargado y confirmá la instalación.
4. Iniciá sesión con cualquiera de las credenciales de prueba de la tabla anterior.

Para regenerar el APK desde el código fuente:

```bash
cd mobile/android
./gradlew assembleRelease
# Resultado en mobile/android/app/build/outputs/apk/release/app-release.apk
```

## Endpoints principales

- API: `https://lacase-backend.onrender.com/api`
- Health: `GET /api/health`
- Productos: `GET /api/products` (filtros + cursor pagination)
- Subastas: `GET /api/auctions` / `POST /api/auctions/:id/bid`
- Chat: `GET /api/chat` / `POST /api/chat/:id/messages`
- Notificaciones: `GET /api/notifications`
- Reportes: `GET /api/admin/reports/sales`
- Moneda: `GET /api/currencies`
- Docs OpenAPI: `https://lacase-backend.onrender.com/api-docs`
