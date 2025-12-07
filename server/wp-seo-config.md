
# Integración con wp-seo Plugin

## Descripción

El plugin [wp-seo de Alley Interactive](https://github.com/alleyinteractive/wp-seo) proporciona funcionalidades avanzadas de SEO para WordPress. Esta integración permite gestionar metadata SEO, generar schema.org markup y analizar el rendimiento SEO de los posts.

## Instalación del Plugin en WordPress

1. Descarga el plugin desde GitHub:
```bash
cd wp-content/plugins
git clone https://github.com/alleyinteractive/wp-seo.git
```

2. Activa el plugin desde el panel de WordPress:
   - Ve a **Plugins** → **Installed Plugins**
   - Busca "WP SEO"
   - Click en **Activate**

## Características Principales

### 1. Metadata SEO Completa
- Títulos SEO personalizados
- Meta descripciones
- Palabras clave
- URLs canónicas
- Configuración de robots (index/noindex)

### 2. Open Graph y Twitter Cards
- Títulos y descripciones sociales
- Imágenes optimizadas para redes sociales
- Preview en tiempo real

### 3. Schema.org Markup
- Generación automática de structured data
- Soporte para múltiples tipos de schema (Article, Product, etc.)
- Validación con Google Rich Results Test

### 4. Análisis SEO
- Análisis de densidad de keywords
- Verificación de meta tags
- Sugerencias de mejora

## API Endpoints Disponibles

### Obtener SEO de un Post
```bash
GET /api/wp-seo/posts/:postId/seo
```

### Actualizar SEO de un Post
```bash
PUT /api/wp-seo/posts/:postId/seo
Content-Type: application/json

{
  "title": "Título SEO optimizado",
  "description": "Descripción meta de 120-160 caracteres",
  "keywords": "palabra1, palabra2, palabra3",
  "og_title": "Título para Facebook",
  "twitter_title": "Título para Twitter"
}
```

### Analizar SEO
```bash
GET /api/wp-seo/posts/:postId/analyze
```

### Generar Schema
```bash
POST /api/wp-seo/posts/:postId/schema
Content-Type: application/json

{
  "schemaType": "Article"
}
```

### Obtener Posts con SEO Incompleto
```bash
GET /api/wp-seo/posts/incomplete?limit=20
```

### Sugerencias de Mejora
```bash
GET /api/wp-seo/posts/:postId/suggestions
```

## Uso desde la Interfaz

### En Content Creator
Al crear contenido, el sistema puede:
- Generar metadata SEO automáticamente usando OpenAI
- Sugerir mejoras basadas en análisis SEO
- Aplicar directamente la metadata al post de WordPress

### En SEO Analyzer
- Ver posts que necesitan optimización
- Obtener sugerencias específicas
- Exportar/importar datos SEO en batch

## Variables de Entorno

```bash
# WordPress Credentials (ya configuradas)
WP_USERNAME=walchlaw4
WP_PASSWORD=tu_password
```

## Integración con Workflows n8n

Puedes crear workflows que:
1. Analicen automáticamente nuevos posts
2. Envíen alertas si faltan datos SEO
3. Generen reports semanales de optimización

## Ejemplo de Uso con OpenAI

```typescript
// Generar metadata SEO con IA
const content = "Tu contenido aquí...";
const metadata = await generateMetadata(content, ['abogado', 'lesiones']);

// Aplicar al post en WordPress
await wpSeo.updatePostSEO(postId, {
  title: metadata.title,
  description: metadata.description,
  keywords: metadata.keywords.join(', ')
});
```

## Mejores Prácticas

1. **Títulos SEO**: 50-60 caracteres
2. **Meta Descripciones**: 120-160 caracteres
3. **Keywords**: 3-5 palabras clave relevantes
4. **Imágenes**: Siempre incluir Open Graph image
5. **Schema**: Usar el tipo más apropiado para el contenido

## Troubleshooting

### Error: "wp-seo plugin is not accessible"
- Verifica que el plugin esté instalado y activado en WordPress
- Confirma que las credenciales sean correctas
- Asegúrate de que la REST API de WordPress esté habilitada

### Error: "Failed to update SEO data"
- Verifica permisos de usuario en WordPress
- Confirma que el post existe y es editable
- Revisa los logs del servidor para más detalles
