
import axios from 'axios';

const NO_COST_AI_URL = 'https://api.no-cost-ai.com/v1/chat/completions';

export interface NoCostAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NoCostAIRequest {
  model: string; // 'gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-2.0-flash-exp', etc.
  messages: NoCostAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface NoCostAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateWithNoCostAI(request: NoCostAIRequest): Promise<string> {
  try {
    const response = await axios.post<NoCostAIResponse>(
      NO_COST_AI_URL,
      {
        model: request.model || 'gpt-4o',
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 4096,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error calling no-cost-ai API:', error.response?.data || error.message);
    throw new Error(`Failed to generate content with no-cost-ai: ${error.message}`);
  }
}

export async function generateContentWithNoCostAI(
  topic: string,
  keywords: string[],
  wordCount: number,
  tone: string,
  language: string = 'es',
  model: string = 'gpt-4o'
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

  const content = await generateWithNoCostAI({
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: Math.min(wordCount * 3, 8000),
    temperature: 0.7,
  });

  // Generar meta descripción
  const metaDescription = await generateWithNoCostAI({
    model,
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en SEO que crea meta descripciones persuasivas y optimizadas.',
      },
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
