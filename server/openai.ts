
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ContentGenerationParams {
  campaignId: string;
  template: string;
  prompt: string;
  keywords: string;
  wordCount: number;
  creativity: number;
  includeImages: boolean;
  includeSEO: boolean;
  tone?: string;
  language?: string;
}

export interface ImageGenerationParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Advanced content generation with streaming support
export async function generateContent(params: ContentGenerationParams): Promise<string> {
  const {
    prompt,
    keywords,
    wordCount,
    creativity,
    includeSEO,
    tone = 'professional-empathetic',
    language = 'es'
  } = params;

  const systemPrompt = language === 'es' 
    ? `Eres un experto redactor de contenido SEO especializado en derecho de lesiones personales.
Tu tarea es crear artículos comprensivos, bien estructurados y optimizados para SEO.
${includeSEO ? 'Incluye estructura apropiada de encabezados (H2, H3), sugerencias de enlaces internos y optimización de palabras clave.' : ''}
Escribe en un tono ${tone} adecuado para potenciales clientes legales.`
    : `You are an expert SEO content writer specializing in personal injury law.
Your task is to create comprehensive, well-structured, and SEO-optimized articles.
${includeSEO ? 'Include proper heading structure (H2, H3), internal linking suggestions, and keyword optimization.' : ''}
Write in a ${tone} tone suitable for potential legal clients.`;

  const userPrompt = language === 'es'
    ? `Crea un artículo de ${wordCount} palabras sobre: ${prompt}

Palabras clave objetivo: ${keywords}

Requisitos:
- Usa formato HTML apropiado con encabezados (h2, h3)
- Incluye una introducción atractiva
- Proporciona consejos accionables
- Añade un llamado a la acción claro al final
- Optimiza para SEO con colocación natural de palabras clave
- Usa viñetas y listas numeradas cuando sea apropiado
- Incluye avisos legales relevantes si es necesario`
    : `Create a ${wordCount}-word article about: ${prompt}

Target keywords: ${keywords}

Requirements:
- Use proper HTML formatting with headings (h2, h3)
- Include an engaging introduction
- Provide actionable advice
- Add a clear call-to-action at the end
- Optimize for SEO with natural keyword placement
- Use bullet points and numbered lists where appropriate
- Include relevant legal disclaimers if needed`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: creativity,
      max_tokens: Math.ceil(wordCount * 1.5),
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate content with OpenAI');
  }
}

// Streaming content generation for real-time updates
export async function* generateContentStream(params: ContentGenerationParams): AsyncGenerator<string> {
  const {
    prompt,
    keywords,
    wordCount,
    creativity,
    includeSEO,
    tone = 'professional-empathetic',
    language = 'es'
  } = params;

  const systemPrompt = language === 'es' 
    ? `Eres un experto redactor de contenido SEO especializado en derecho de lesiones personales.`
    : `You are an expert SEO content writer specializing in personal injury law.`;

  const userPrompt = `Crea un artículo de ${wordCount} palabras sobre: ${prompt}\nPalabras clave: ${keywords}`;

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: creativity,
      max_tokens: Math.ceil(wordCount * 1.5),
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error('OpenAI Streaming Error:', error);
    throw new Error('Failed to stream content generation');
  }
}

// Chat-based content refinement
export async function refineContent(
  originalContent: string,
  refinementInstructions: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Eres un asistente experto en refinamiento de contenido legal y SEO.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: `Contenido original:\n${originalContent}\n\nInstrucciones de refinamiento: ${refinementInstructions}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Content refinement error:', error);
    throw new Error('Failed to refine content');
  }
}

// Generate images with DALL-E 3
export async function generateImages(params: ImageGenerationParams): Promise<string[]> {
  const {
    prompt,
    size = '1024x1024',
    quality = 'standard',
    style = 'natural',
    n = 1
  } = params;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size,
      quality,
      style,
      n
    });

    return response.data.map(img => img.url || '');
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate images');
  }
}

// SEO optimization analysis
export async function optimizeSEO(content: string, keywords: string[]): Promise<{
  score: number;
  suggestions: string[];
  keywordDensity: Record<string, number>;
  improvements: string;
}> {
  const wordCount = content.split(/\s+/).length;
  const keywordDensity: Record<string, number> = {};
  
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;
    keywordDensity[keyword] = (count / wordCount) * 100;
  });

  const suggestions: string[] = [];
  let score = 100;

  // Check keyword density (ideal: 1-2%)
  Object.entries(keywordDensity).forEach(([keyword, density]) => {
    if (density < 0.5) {
      suggestions.push(`Aumentar densidad de "${keyword}" (actual: ${density.toFixed(2)}%)`);
      score -= 10;
    } else if (density > 3) {
      suggestions.push(`Reducir densidad de "${keyword}" (actual: ${density.toFixed(2)}%)`);
      score -= 15;
    }
  });

  // Check for headings
  if (!content.includes('<h2>')) {
    suggestions.push('Agregar encabezados H2 para mejor estructura');
    score -= 20;
  }

  // Use AI to suggest improvements
  let improvements = '';
  try {
    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en SEO. Analiza el contenido y proporciona sugerencias específicas de mejora.'
        },
        {
          role: 'user',
          content: `Analiza este contenido para SEO:\n\n${content.slice(0, 2000)}\n\nPalabras clave objetivo: ${keywords.join(', ')}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    improvements = aiAnalysis.choices[0].message.content || '';
  } catch (error) {
    console.error('AI SEO analysis error:', error);
  }

  return {
    score: Math.max(0, score),
    suggestions,
    keywordDensity,
    improvements
  };
}

// Generate image suggestions using GPT-4 Vision (or GPT-4 for text analysis)
export async function generateImageSuggestions(content: string): Promise<string[]> {
  const prompt = `Basándote en este contenido de artículo, sugiere 3-5 descripciones de imágenes relevantes que mejorarían el artículo:

${content.slice(0, 1500)}...

Proporciona las sugerencias de imágenes como una lista numerada en español.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const suggestions = completion.choices[0].message.content || '';
    return suggestions.split('\n').filter(s => s.trim().length > 0);
  } catch (error) {
    console.error('Failed to generate image suggestions:', error);
    return [];
  }
}

// Generate meta tags and SEO metadata
export async function generateMetadata(content: string, keywords: string[]): Promise<{
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  schema: string;
}> {
  try {
    const prompt = `Basándote en este contenido, genera metadata SEO optimizada:

${content.slice(0, 1000)}...

Palabras clave: ${keywords.join(', ')}

Genera:
1. Meta title (50-60 caracteres)
2. Meta description (150-160 caracteres)
3. Open Graph title
4. Open Graph description
5. Schema.org JSON-LD para artículo legal

Responde en formato JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en SEO y metadata. Responde solo con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const metadata = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      title: metadata.title || '',
      description: metadata.description || '',
      ogTitle: metadata.ogTitle || metadata.title || '',
      ogDescription: metadata.ogDescription || metadata.description || '',
      schema: metadata.schema || '{}'
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: '',
      description: '',
      ogTitle: '',
      ogDescription: '',
      schema: '{}'
    };
  }
}

// Batch content generation for multiple topics
export async function batchGenerateContent(
  topics: Array<{ prompt: string; keywords: string }>,
  baseParams: Omit<ContentGenerationParams, 'prompt' | 'keywords'>
): Promise<Array<{ topic: string; content: string; error?: string }>> {
  const results = [];

  for (const topic of topics) {
    try {
      const content = await generateContent({
        ...baseParams,
        prompt: topic.prompt,
        keywords: topic.keywords
      });
      results.push({ topic: topic.prompt, content });
    } catch (error) {
      results.push({
        topic: topic.prompt,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

// Check OpenAI API health
export async function checkAPIHealth(): Promise<{ healthy: boolean; model: string }> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5
    });
    
    return {
      healthy: true,
      model: completion.model
    };
  } catch (error) {
    console.error('OpenAI API health check failed:', error);
    return {
      healthy: false,
      model: 'unavailable'
    };
  }
}
