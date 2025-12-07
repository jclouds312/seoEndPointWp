
# SEO Automation Hub - Guía de Usuario

## ¿Qué es SEO Automation Hub?

SEO Automation Hub es una plataforma centralizada que te permite gestionar múltiples blogs de WordPress, generar contenido SEO automatizado, y monitorear el rendimiento de tus publicaciones desde un solo lugar.

## Características Principales

### 1. Gestión de Campañas
- Administra múltiples blogs desde un solo panel
- Genera scripts de embed personalizados para cada blog
- Activa/pausa campañas según necesites

### 2. Integración con WordPress
- Plugin PHP fácil de instalar
- Se integra perfectamente con Yoast SEO Premium
- Dashboard embebido dentro del admin de WordPress

### 3. Automatización SEO
- Publicación programada de contenido
- Optimización automática de keywords
- Análisis de rendimiento en tiempo real

## Primeros Pasos

### Paso 1: Acceder al Dashboard
1. Visita tu URL de Replit: `https://[tu-repl].replit.app`
2. Inicia sesión con tus credenciales

### Paso 2: Crear una Campaña
1. Haz clic en "Campañas" en el menú lateral
2. Presiona "Nueva Campaña"
3. Completa la información:
   - **Nombre**: Identifica tu campaña (ej: "Blog Texas")
   - **URL del Blog**: La dirección de tu sitio WordPress
   - **Descripción**: Notas sobre esta campaña

### Paso 3: Instalar el Plugin en WordPress
1. Copia el código generado automáticamente
2. Crea un archivo `seo-hub-[nombre-campaña].php` en tu computadora
3. Sube el archivo a `/wp-content/plugins/` vía FTP o File Manager
4. Activa el plugin desde WordPress Admin > Plugins
5. Verás un nuevo menú "SEO Hub" en tu panel de WordPress

### Paso 4: Configurar la URL de Replit
En el código del plugin, reemplaza `[YOUR-REPLIT-URL]` con tu URL real:
```php
// Antes
src="https://[YOUR-REPLIT-URL].replit.app/?campaign=..."

// Después
src="https://mi-seo-hub.replit.app/?campaign=..."
```

## Uso Diario

### Dashboard Principal
- **Publicaciones Activas**: Número total de posts publicados
- **Campañas Activas**: Blogs conectados
- **Rendimiento**: Métricas de tráfico y engagement

### Gestión de Campañas
- **Pausar Campaña**: Detiene temporalmente la automatización
- **Eliminar Campaña**: Remueve el blog del sistema
- **Ver Stats**: Analiza el rendimiento individual

### Soporte
Para soporte técnico, contacta a tu desarrollador o visita la sección de Documentación en el dashboard.

## Preguntas Frecuentes

**¿Necesito conocimientos técnicos?**
No. La interfaz está diseñada para ser intuitiva. Solo necesitas saber copiar/pegar y acceder al panel de WordPress.

**¿Puedo usar esto con cualquier tema de WordPress?**
Sí, es compatible con cualquier tema. El plugin se integra con el admin de WordPress.

**¿Cuántos blogs puedo conectar?**
No hay límite. Puedes crear tantas campañas como blogs tengas.

**¿Es compatible con Yoast SEO?**
Sí, está diseñado específicamente para funcionar con Yoast SEO Premium v25.7+.
