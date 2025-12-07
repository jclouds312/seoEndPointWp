
import axios from 'axios';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeRequest {
  model?: string;
  messages: ClaudeMessage[];
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function generateWithClaude(request: ClaudeRequest): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY not found in environment variables');
  }

  try {
    const response = await axios.post<ClaudeResponse>(
      CLAUDE_API_URL,
      {
        model: request.model || 'claude-3-5-sonnet-20241022',
        max_tokens: request.max_tokens || 4096,
        temperature: request.temperature || 0.7,
        system: request.system,
        messages: request.messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0].text;
  } catch (error: any) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    throw new Error(`Failed to generate content with Claude: ${error.message}`);
  }
}

export async function generateContentWithClaude(
  topic: string,
  keywords: string[],
  wordCount: number,
  tone: string,
  language: string = 'es'
): Promise<{
  title: string;
  content: string;
  metaDescription: string;
  seoScore: number;
}> {
  const prompt = `Crea un artículo profesional de blog en ${language === 'es' ? 'español' : 'inglés'} sobre el siguiente tema:

Tema: ${topic}
Palabras clave objetivo: ${keywords.join(', ')}
Longitud aproximada: ${wordCount} palabras
Tono: ${tone}

El artículo debe:
1. Tener un título SEO-optimizado (H1)
2. Incluir subtítulos relevantes (H2 y H3)
3. Incorporar las palabras clave de forma natural
4. Tener una estructura clara con introducción, desarrollo y conclusión
5. Incluir ejemplos prácticos si es aplicable
6. Estar optimizado para SEO
7. Ser informativo y de alta calidad

Formato del artículo en HTML semántico (solo el contenido, sin tags <html>, <head> o <body>).`;

  const systemPrompt = 'Eres un experto escritor de contenido SEO especializado en crear artículos de alta calidad, informativos y optimizados para motores de búsqueda. Escribes en un estilo profesional pero accesible.';

  const content = await generateWithClaude({
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: Math.min(wordCount * 3, 8000),
    temperature: 0.7,
  });

  // Generar meta descripción
  const metaDescription = await generateWithClaude({
    system: 'Eres un experto en SEO que crea meta descripciones persuasivas y optimizadas.',
    messages: [
      {
        role: 'user',
        content: `Genera una meta descripción SEO de máximo 155 caracteres para este artículo sobre: ${topic}. Debe incluir la palabra clave principal: ${keywords[0]}`,
      },
    ],
    max_tokens: 100,
  });

  // Extraer título del contenido HTML
  const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : topic;

  // Calcular SEO score básico
  let seoScore = 50;
  const wordCountActual = content.split(/\s+/).length;
  if (wordCountActual >= 300) seoScore += 10;
  if (wordCountActual >= 800) seoScore += 10;
  if (/<h2/i.test(content)) seoScore += 10;
  if (/<h3/i.test(content)) seoScore += 5;
  const lowerContent = content.toLowerCase();
  keywords.forEach((keyword) => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      seoScore += 5;
    }
  });

  return {
    title,
    content,
    metaDescription: metaDescription.replace(/['"]/g, '').substring(0, 155),
    seoScore: Math.min(seoScore, 100),
  };
}
