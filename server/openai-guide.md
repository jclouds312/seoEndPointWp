
# Guía de Integración OpenAI

Esta aplicación integra la biblioteca oficial de OpenAI para Node.js con funcionalidades avanzadas.

## Configuración

Asegúrate de tener tu API key configurada en las variables de entorno:

```bash
OPENAI_API_KEY=sk-...
```

## Funciones Disponibles

### 1. Generación de Contenido Básica

```typescript
const content = await generateContent({
  campaignId: '1',
  template: 'injury-guide',
  prompt: 'Escribe sobre accidentes de auto',
  keywords: 'abogado de accidentes, compensación',
  wordCount: 1500,
  creativity: 0.7,
  includeImages: true,
  includeSEO: true,
  tone: 'professional-empathetic',
  language: 'es'
});
```

### 2. Generación con Streaming (Tiempo Real)

```typescript
for await (const chunk of generateContentStream(params)) {
  console.log(chunk); // Muestra contenido en tiempo real
}
```

### 3. Refinamiento de Contenido

```typescript
const refined = await refineContent(
  originalContent,
  'Hazlo más persuasivo y agrega estadísticas',
  conversationHistory
);
```

### 4. Generación de Imágenes con DALL-E 3

```typescript
const imageUrls = await generateImages({
  prompt: 'Accidente de carro en intersección urbana, estilo fotográfico',
  size: '1024x1024',
  quality: 'hd',
  style: 'natural',
  n: 1
});
```

### 5. Optimización SEO con IA

```typescript
const seo = await optimizeSEO(content, ['abogado', 'lesiones']);
// Retorna: score, suggestions, keywordDensity, improvements
```

### 6. Generación de Metadata SEO

```typescript
const metadata = await generateMetadata(content, keywords);
// Retorna: title, description, ogTitle, ogDescription, schema
```

### 7. Generación en Lote

```typescript
const results = await batchGenerateContent(
  [
    { prompt: 'Tema 1', keywords: 'kw1' },
    { prompt: 'Tema 2', keywords: 'kw2' }
  ],
  baseParams
);
```

## Endpoints API

- `POST /api/content/generate` - Generación básica
- `POST /api/content/generate-stream` - Generación con streaming
- `POST /api/content/refine` - Refinamiento de contenido
- `POST /api/images/generate` - Generación de imágenes
- `POST /api/content/metadata` - Generación de metadata
- `POST /api/content/batch-generate` - Generación en lote
- `GET /api/openai/health` - Verificar estado de API

## Modelos Utilizados

- **gpt-4-turbo-preview**: Contenido largo y complejo
- **gpt-3.5-turbo**: Tareas rápidas y análisis
- **dall-e-3**: Generación de imágenes de alta calidad

## Mejores Prácticas

1. **Control de Costos**: Usa `max_tokens` apropiadamente
2. **Temperatura**: 0.3-0.5 para contenido factual, 0.7-0.9 para creatividad
3. **Streaming**: Usa para mejor UX en contenido largo
4. **Rate Limits**: Implementa retry logic y manejo de errores
5. **Caché**: Guarda contenido generado para evitar regeneración

## Manejo de Errores

Todos los errores de OpenAI son capturados y registrados. Asegúrate de implementar:

- Reintentos automáticos
- Fallbacks
- Mensajes de error amigables para el usuario
