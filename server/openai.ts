
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ContentGenerationRequest {
  topic: string;
  keywords: string[];
  wordCount: number;
  tone: string;
  language?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  suggestedImages: string[];
  seoScore: number;
}

export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const { topic, keywords, wordCount, tone, language = 'es' } = request;

  const prompt = `
Crea un artículo profesional de blog en ${language === 'es' ? 'español' : 'inglés'} sobre el siguiente tema:

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

Formato del artículo en HTML semántico (solo el contenido, sin tags <html>, <head> o <body>).
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Eres un experto escritor de contenido SEO especializado en crear artículos de alta calidad, informativos y optimizados para motores de búsqueda. Escribes en un estilo profesional pero accesible."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: Math.min(wordCount * 2, 4000),
    });

    const content = completion.choices[0].message.content || '';

    // Generar meta descripción
    const metaPrompt = `Genera una meta descripción SEO de máximo 155 caracteres para este artículo sobre: ${topic}. Debe incluir la palabra clave principal: ${keywords[0]}`;
    
    const metaCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un experto en SEO que crea meta descripciones persuasivas y optimizadas." },
        { role: "user", content: metaPrompt }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const metaDescription = metaCompletion.choices[0].message.content || '';

    // Extraer título del contenido HTML
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '') : topic;

    // Sugerir búsquedas de imágenes relacionadas
    const suggestedImages = [
      `${keywords[0]} ilustración`,
      `${topic} infografía`,
      `${keywords[1] || keywords[0]} diagrama`,
    ];

    return {
      title,
      content,
      metaDescription: metaDescription.replace(/['"]/g, '').substring(0, 155),
      suggestedImages,
      seoScore: calculateSEOScore(content, keywords),
    };
  } catch (error: any) {
    console.error('Error generating content with OpenAI:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

function calculateSEOScore(content: string, keywords: string[]): number {
  let score = 50; // Base score

  // Check word count
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) score += 10;
  if (wordCount >= 800) score += 10;

  // Check for headings
  if (/<h2/i.test(content)) score += 10;
  if (/<h3/i.test(content)) score += 5;

  // Check keyword presence
  const lowerContent = content.toLowerCase();
  keywords.forEach(keyword => {
    if (lowerContent.includes(keyword.toLowerCase())) {
      score += 5;
    }
  });

  // Cap at 100
  return Math.min(score, 100);
}

export async function generateBulkContent(requests: ContentGenerationRequest[]): Promise<GeneratedContent[]> {
  const results: GeneratedContent[] = [];
  
  for (const request of requests) {
    try {
      const content = await generateContent(request);
      results.push(content);
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
  
  return results;
}
