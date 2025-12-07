
# Configuración de n8n para SEO Automation Hub

## Instalación Local de n8n

Para ejecutar n8n localmente junto con esta aplicación:

```bash
# Opción 1: Usando npx (recomendado para desarrollo)
npx n8n

# Opción 2: Instalación global
npm install n8n -g
n8n start
```

n8n se ejecutará por defecto en `http://localhost:5678`

## Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=tu_api_key_aqui

# Si usas n8n en producción
N8N_WEBHOOK_URL=https://tu-dominio.com/webhook
```

## Obtener API Key de n8n

1. Abre n8n en tu navegador: `http://localhost:5678`
2. Ve a Settings → API
3. Crea un nuevo API Key
4. Copia el key y agrégalo a tu `.env`

## Workflows Pre-configurados

Esta integración incluye 3 templates de workflows:

### 1. Yoast Metadata Sync
- **Trigger**: Cada 6 horas
- **Acciones**: 
  - Obtiene posts de WordPress
  - Extrae metadata de Yoast SEO
  - Guarda en base de datos
  
### 2. AI Content Generation Pipeline
- **Trigger**: Manual
- **Acciones**:
  - Genera contenido con OpenAI GPT-4
  - Formatea el contenido
  - Crea draft en WordPress

### 3. Keyword Density Analyzer
- **Trigger**: Webhook
- **Acciones**:
  - Analiza densidad de keywords
  - Genera reporte
  - Envía email con resultados

## Integración con WordPress

Los workflows pueden conectarse directamente con tu sitio WordPress:

```javascript
// Configuración del nodo WordPress en n8n
{
  "url": "https://www.californiapersonalinjurylawyersblog.com",
  "username": "walchlaw4",
  "password": "tu_password"
}
```

## Webhooks

Para usar webhooks de n8n desde tu aplicación:

```typescript
// Ejemplo: Analizar keywords
const response = await fetch(`${N8N_BASE_URL}/webhook/analyze-keywords`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Tu contenido aqui',
    keywords: ['abogado', 'lesiones', 'compensación']
  })
});
```

## Monitoreo

Accede a las ejecuciones desde:
- UI de n8n: `http://localhost:5678/executions`
- API: `GET /api/n8n/executions`

## Producción

Para producción, considera usar:
- n8n Cloud (https://n8n.io/cloud)
- Docker deployment
- Self-hosted en servidor dedicado

## Troubleshooting

Si n8n no conecta:
1. Verifica que n8n esté corriendo: `curl http://localhost:5678/healthz`
2. Confirma que el API key sea correcto
3. Revisa los logs de n8n: `~/.n8n/logs/`
