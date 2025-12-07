# SEO Automation Hub - Guía del Cliente

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Dashboard](#acceso-al-dashboard)
3. [Gestión de Campañas](#gestión-de-campañas)
4. [Instalación en WordPress](#instalación-en-wordpress)
5. [Publicación SEO Automatizada](#publicación-seo-automatizada)
6. [Soporte](#soporte)

## 🎯 Introducción

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

## 🚀 Gestión de Campañas

### Crear una Nueva Campaña

1. **Acceder a Campañas**
   - Click en "Campañas" en el menú lateral
   - Click en el botón "Nueva Campaña"

2. **Completar Información**
   - **Nombre**: Identificador único de la campaña (ej: "Texas Car Accident Lawyers")
   - **URL del Blog**: Dirección completa del sitio WordPress (https://www.ejemplo.com)
   - **Descripción**: Opcional, describe el propósito de la campaña

3. **Generar Script de Embed**
   - El sistema generará automáticamente un script PHP personalizado
   - Este script permite integrar el dashboard dentro de WordPress Admin

### Instalar en WordPress

1. **Copiar el Script**
   - Click en "Copiar Código" en la tarjeta de la campaña
   - El script PHP quedará en tu portapapeles

2. **Crear el Plugin**
   - Crea un archivo nuevo llamado `seo-hub-[nombre-campaña].php`
   - Pega el código copiado
   - Guarda el archivo

3. **Subir a WordPress**
   - Accede a tu servidor vía FTP o File Manager
   - Navega a `/wp-content/plugins/`
   - Sube el archivo PHP creado

4. **Activar el Plugin**
   - En WordPress Admin, ve a **Plugins → Installed Plugins**
   - Busca "SEO Automation Hub"
   - Click en "Activate"

5. **Configurar URL de Replit**
   - Edita el archivo PHP en WordPress
   - Reemplaza `[YOUR-REPLIT-URL]` con tu URL real de Replit
   - Ejemplo: `https://tu-proyecto.replit.app`

### Gestionar Campañas Existentes

**Pausar/Activar Campaña**
- Click en el botón "Pausar" para detener temporalmente
- Click en "Activar" para reanudar operaciones

**Eliminar Campaña**
- Click en el icono de papelera
- Confirma la eliminación (acción irreversible)

**Ver Estadísticas**
- Cada tarjeta muestra:
  - Número de publicaciones generadas
  - Estado actual (Activa/Pausada)
  - Fecha de creación