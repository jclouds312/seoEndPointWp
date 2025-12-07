
# SEO Automation Hub - Documentación Técnica

## Stack Tecnológico

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express, Node.js, TypeScript
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Build**: Vite, esbuild
- **Hosting**: Replit (recomendado)

## Estructura del Proyecto

```
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilidades
├── server/              # Backend Express
│   ├── index.ts        # Punto de entrada
│   ├── campaigns.ts    # API de campañas
│   ├── db.ts           # Configuración DB
│   └── routes.ts       # Rutas adicionales
├── shared/             # Código compartido
│   └── schema.ts       # Schemas de Drizzle ORM
└── script/             # Scripts de build
```

## Configuración del Entorno

### Variables de Entorno

Crea un archivo `.env` (en Secrets de Replit):

```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
PORT=5000
SESSION_SECRET=tu-secreto-aleatorio-seguro
```

### Base de Datos

1. **Crear tablas**:
```bash
npm run db:push
```

2. **Generar migraciones** (si es necesario):
```bash
npx drizzle-kit generate:pg
```

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Desarrollo (cliente + servidor)
npm run dev

# Solo cliente
npm run dev:client
```

La aplicación estará disponible en `http://localhost:5000`

## API Endpoints

### Campañas

**GET /api/campaigns**
- Retorna todas las campañas
- Respuesta: `Campaign[]`

**GET /api/campaigns/:id**
- Retorna una campaña específica
- Respuesta: `Campaign`

**POST /api/campaigns**
- Crea una nueva campaña
- Body: `{ name, blogUrl, description }`
- Respuesta: `Campaign`

**PUT /api/campaigns/:id**
- Actualiza una campaña
- Body: Campos a actualizar
- Respuesta: `Campaign`

**DELETE /api/campaigns/:id**
- Elimina una campaña
- Respuesta: 204 No Content

### Schemas

```typescript
interface Campaign {
  id: number;
  name: string;
  blogUrl: string;
  description?: string;
  embedCode: string;
  status: 'active' | 'paused';
  posts: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  config?: Record<string, any>;
}
```

## 🚀 Despliegue

### Opción 1: Despliegue en Replit (Recomendado)

#### Configuración Inicial

1. **Variables de Entorno**
   - Click en "Secrets" (icono de candado) en Replit
   - Agrega las siguientes variables:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/database
     SESSION_SECRET=tu-secreto-seguro-aleatorio
     ```

2. **Configurar Database**
   - Usa Replit Database o PostgreSQL externo
   - Ejecuta las migraciones:
     ```bash
     npm run db:migrate
     ```

#### Deploy Automático

### Método 1: Desde la UI

1. Click en "Release" > "Deploy"
2. Selecciona el tier (Shared o Dedicated)
3. Configura los comandos:
   - **Build**: `npm run build`
   - **Run**: `npm run start`
4. Añade las variables de entorno en Secrets
5. Click "Deploy your project"

### Método 2: GitHub Integration

1. Conecta tu repositorio en Replit
2. Importa desde GitHub
3. Replit auto-detectará la configuración
4. Sigue el proceso de deploy

### Opción 2: Despliegue en Vercel

1. **Conectar Repositorio**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configurar Variables de Entorno**
   - En Vercel Dashboard → Settings → Environment Variables
   - Agregar:
     - `DATABASE_URL`: URL de PostgreSQL
     - `NODE_ENV`: production

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configuración Automática**
   - Vercel detectará automáticamente el archivo `vercel.json`
   - Build command: `npm run build`
   - Output directory: `dist/public`

### Opción 3: Despliegue en Firebase

1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Inicializar Proyecto**
   ```bash
   firebase init hosting
   firebase init functions
   ```

3. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Variables de Entorno Necesarias

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `SESSION_SECRET`: Secreto para sesiones
- `NODE_ENV`: `production`

## Build para Producción

```bash
# Build completo (cliente + servidor)
npm run build

# Inicia en producción
npm run start
```

El build genera:
- `dist/public/`: Archivos estáticos del frontend
- `dist/index.cjs`: Servidor bundle optimizado

## Integración con WordPress

El código generado crea un plugin PHP que:
1. Registra un menú en WordPress Admin
2. Embebe el dashboard en un iframe
3. Pasa parámetros de campaña vía URL

### Personalización del Embed

Modifica `client/src/pages/campaigns.tsx` función `generateEmbedCode()` para cambiar:
- Nombre del plugin
- Icono del menú
- Permisos requeridos
- URL de destino

## Troubleshooting

### Error de Conexión a DB
```bash
# Verifica la variable DATABASE_URL
echo $DATABASE_URL

# Prueba la conexión
npx drizzle-kit studio
```

### Puerto ya en uso
El puerto 5000 está configurado. Si necesitas cambiarlo, actualiza:
- `vite.config.ts` (dev server)
- `.replit` (deployment)
- `server/index.ts` (backend)

### Build Failures
```bash
# Limpia y reinstala
rm -rf node_modules dist
npm install
npm run build
```

## Extensiones Recomendadas

Para desarrollo en Replit:
- TypeScript auto-complete habilitado
- Hot reload configurado
- Source maps en desarrollo

## Testing

```bash
# Añade tests (ejemplo con Vitest)
npm install -D vitest @vitest/ui

# Ejecuta tests
npm test
```

## Contribuir

1. Fork el proyecto
2. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Añade nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## Licencia

MIT License - puedes usar este código libremente en proyectos comerciales.
