
import OpenAI from 'openai';
import { marked } from 'marked';
import { htmlToText } from 'html-to-text';
import Sentiment from 'sentiment';
import * as natural from 'natural';
import * as cheerio from 'cheerio';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize NLP tools
const sentiment = new Sentiment();
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

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
  targetAudience?: string;
  contentType?: 'blog' | 'article' | 'guide' | 'landing' | 'social';
  includeSchema?: boolean;
  includeInternalLinks?: boolean;
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

export interface ContentAnalysis {
  wordCount: number;
  readingTime: number;
  readabilityScore: number;
  sentimentScore: number;
  keywordDensity: Record<string, number>;
  headingsStructure: Array<{ level: number; text: string }>;
  internalLinks: number;
  externalLinks: number;
  images: number;
  suggestions: string[];
}

export interface SEOOptimizationResult {
  score: number;
  suggestions: string[];
  keywordDensity: Record<string, number>;
  improvements: string;
  metaAnalysis: {
    titleLength: number;
    descriptionLength: number;
    hasH1: boolean;
    headingsCount: number;
    imageAltTags: number;
  };
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
    language = 'es',
    targetAudience = 'clientes potenciales',
    contentType = 'article',
    includeSchema = true,
    includeInternalLinks = true
  } = params;

  const contentTypeInstructions = {
    blog: 'un artículo de blog conversacional y accesible',
    article: 'un artículo informativo y detallado',
    guide: 'una guía paso a paso completa y práctica',
    landing: 'contenido persuasivo para página de aterrizaje',
    social: 'contenido breve y atractivo para redes sociales'
  };

  const systemPrompt = language === 'es' 
    ? `Eres un experto redactor de contenido SEO especializado en derecho de lesiones personales.
Tu tarea es crear ${contentTypeInstructions[contentType]} comprensivo, bien estructurado y optimizado para SEO.
Audiencia objetivo: ${targetAudience}
${includeSEO ? `Incluye:
- Estructura apropiada de encabezados (H1, H2, H3)
- Optimización de palabras clave (densidad 1-2%)
- Meta título y descripción
- URLs sugeridas
- Schema.org markup si es relevante` : ''}
${includeInternalLinks ? '- Sugerencias de enlaces internos relevantes' : ''}
Escribe en un tono ${tone} adecuado para potenciales clientes legales.
Usa formato HTML semántico con tags apropiados.`
    : `You are an expert SEO content writer specializing in personal injury law.
Your task is to create comprehensive, well-structured, and SEO-optimized ${contentTypeInstructions[contentType]}.
Target audience: ${targetAudience}
${includeSEO ? `Include:
- Proper heading structure (H1, H2, H3)
- Keyword optimization (1-2% density)
- Meta title and description
- Suggested URLs
- Schema.org markup if relevant` : ''}
${includeInternalLinks ? '- Internal linking suggestions' : ''}
Write in a ${tone} tone suitable for potential legal clients.
Use semantic HTML formatting with appropriate tags.`;

  const userPrompt = language === 'es'
    ? `Crea ${contentTypeInstructions[contentType]} de ${wordCount} palabras sobre: ${prompt}

Palabras clave objetivo: ${keywords}

Requisitos específicos:
- Usa formato HTML semántico (h1, h2, h3, p, ul, ol, strong, em)
- Incluye una introducción atractiva con gancho emocional
- Desarrolla cada sección con ejemplos concretos y casos de uso
- Proporciona consejos accionables y pasos específicos
- Incluye estadísticas relevantes cuando sea posible
- Añade un llamado a la acción claro y convincente
- Optimiza para featured snippets con listas y tablas
- Usa viñetas y listas numeradas estratégicamente
- Incluye preguntas frecuentes (FAQ) al final
- Añade avisos legales y disclaimers apropiados
- Sugiere ${Math.ceil(wordCount / 300)} lugares para incluir enlaces internos
${includeSchema ? '- Genera Schema.org JSON-LD para el tipo de contenido apropiado' : ''}`
    : `Create ${contentTypeInstructions[contentType]} of ${wordCount} words about: ${prompt}

Target keywords: ${keywords}

Specific requirements:
- Use semantic HTML formatting (h1, h2, h3, p, ul, ol, strong, em)
- Include an engaging introduction with emotional hook
- Develop each section with concrete examples and use cases
- Provide actionable advice and specific steps
- Include relevant statistics when possible
- Add a clear and compelling call-to-action
- Optimize for featured snippets with lists and tables
- Use bullet points and numbered lists strategically
- Include FAQ section at the end
- Add appropriate legal disclaimers
- Suggest ${Math.ceil(wordCount / 300)} places for internal links
${includeSchema ? '- Generate Schema.org JSON-LD for appropriate content type' : ''}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: creativity,
      max_tokens: Math.ceil(wordCount * 2),
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    let content = completion.choices[0].message.content || '';
    
    // Post-process content to ensure quality
    content = await postProcessContent(content, keywords.split(',').map(k => k.trim()));
    
    return content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate content with OpenAI');
  }
}

// Post-process and enhance generated content
async function postProcessContent(content: string, keywords: string[]): Promise<string> {
  const $ = cheerio.load(content);
  
  // Ensure proper heading hierarchy
  if ($('h1').length === 0) {
    const firstH2 = $('h2').first();
    if (firstH2.length > 0) {
      firstH2.replaceWith(`<h1>${firstH2.html()}</h1>`);
    }
  }
  
  // Add keyword emphasis where appropriate
  keywords.forEach(keyword => {
    $('p').each((i, elem) => {
      const text = $(elem).html();
      if (text && !text.includes('<strong>') && text.toLowerCase().includes(keyword.toLowerCase())) {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
        const matches = text.match(regex);
        if (matches && matches.length === 1) {
          $(elem).html(text.replace(regex, '<strong>$1</strong>'));
        }
      }
    });
  });
  
  return $.html();
}

// Streaming content generation for real-time updates
export async function* generateContentStream(params: ContentGenerationParams): AsyncGenerator<string, void, unknown> {
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
      max_tokens: Math.ceil(wordCount * 2),
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

// Comprehensive content analysis
export async function analyzeContent(content: string, keywords: string[]): Promise<ContentAnalysis> {
  const $ = cheerio.load(content);
  const plainText = htmlToText(content, {
    wordwrap: false,
    preserveNewlines: false
  });
  
  const words = tokenizer.tokenize(plainText.toLowerCase()) || [];
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  
  // Calculate keyword density
  const keywordDensity: Record<string, number> = {};
  keywords.forEach(keyword => {
    const keywordWords = keyword.toLowerCase().split(' ');
    let count = 0;
    
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const slice = words.slice(i, i + keywordWords.length).join(' ');
      if (slice === keyword.toLowerCase()) {
        count++;
      }
    }
    
    keywordDensity[keyword] = (count / wordCount) * 100;
  });
  
  // Sentiment analysis
  const sentimentResult = sentiment.analyze(plainText);
  const sentimentScore = sentimentResult.score;
  
  // Analyze heading structure
  const headingsStructure: Array<{ level: number; text: string }> = [];
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const level = parseInt(elem.tagName.substring(1));
    const text = $(elem).text();
    headingsStructure.push({ level, text });
  });
  
  // Count links and images
  const internalLinks = $('a[href^="/"], a[href^="#"]').length;
  const externalLinks = $('a[href^="http"]').length;
  const images = $('img').length;
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (wordCount < 300) {
    suggestions.push('El contenido es muy corto. Considera expandir a al menos 800 palabras.');
  }
  
  if (headingsStructure.length === 0) {
    suggestions.push('Agregar encabezados (H2, H3) para mejor estructura.');
  }
  
  if (!headingsStructure.some(h => h.level === 1)) {
    suggestions.push('Falta encabezado H1 principal.');
  }
  
  Object.entries(keywordDensity).forEach(([keyword, density]) => {
    if (density < 0.5) {
      suggestions.push(`Aumentar densidad de "${keyword}" (actual: ${density.toFixed(2)}%)`);
    } else if (density > 3) {
      suggestions.push(`Reducir densidad de "${keyword}" para evitar keyword stuffing (actual: ${density.toFixed(2)}%)`);
    }
  });
  
  if (images === 0) {
    suggestions.push('Agregar imágenes relevantes para mejor engagement.');
  }
  
  if (internalLinks < 2) {
    suggestions.push('Incluir más enlaces internos a contenido relacionado.');
  }
  
  // Simple readability calculation (Flesch Reading Ease approximation)
  const sentences = plainText.split(/[.!?]+/).length;
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);
  const readabilityScore = 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount);
  
  return {
    wordCount,
    readingTime,
    readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
    sentimentScore,
    keywordDensity,
    headingsStructure,
    internalLinks,
    externalLinks,
    images,
    suggestions
  };
}

// Helper function to count syllables
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Extract keywords using TF-IDF
export async function extractKeywords(content: string, topN: number = 10): Promise<Array<{ word: string; score: number }>> {
  const plainText = htmlToText(content);
  const tfidf = new TfIdf();
  tfidf.addDocument(plainText);
  
  const keywords: Array<{ word: string; score: number }> = [];
  
  tfidf.listTerms(0).forEach(item => {
    if (item.term.length > 3 && keywords.length < topN) {
      keywords.push({ word: item.term, score: item.tfidf });
    }
  });
  
  return keywords.sort((a, b) => b.score - a.score);
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
        content: 'Eres un asistente experto en refinamiento de contenido legal y SEO. Mantén el formato HTML y mejora el contenido según las instrucciones.'
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
      prompt: `${prompt}. Professional, high-quality, suitable for legal website.`,
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

// Enhanced SEO optimization analysis
export async function optimizeSEO(content: string, keywords: string[]): Promise<SEOOptimizationResult> {
  const $ = cheerio.load(content);
  const plainText = htmlToText(content);
  const words = tokenizer.tokenize(plainText.toLowerCase()) || [];
  const wordCount = words.length;
  
  const keywordDensity: Record<string, number> = {};
  
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = plainText.match(regex);
    const count = matches ? matches.length : 0;
    keywordDensity[keyword] = (count / wordCount) * 100;
  });

  const suggestions: string[] = [];
  let score = 100;

  // Meta analysis
  const titleLength = $('title').text().length;
  const descriptionLength = $('meta[name="description"]').attr('content')?.length || 0;
  const hasH1 = $('h1').length > 0;
  const headingsCount = $('h2, h3, h4').length;
  const imageAltTags = $('img[alt]').length;
  const totalImages = $('img').length;

  // Check keyword density (ideal: 1-2%)
  Object.entries(keywordDensity).forEach(([keyword, density]) => {
    if (density < 0.5) {
      suggestions.push(`Aumentar densidad de "${keyword}" (actual: ${density.toFixed(2)}%)`);
      score -= 10;
    } else if (density > 3) {
      suggestions.push(`Reducir densidad de "${keyword}" para evitar penalización (actual: ${density.toFixed(2)}%)`);
      score -= 15;
    }
  });

  // Check for headings
  if (!hasH1) {
    suggestions.push('Falta encabezado H1 principal');
    score -= 20;
  }
  
  if (headingsCount < 3) {
    suggestions.push('Agregar más encabezados (H2, H3) para mejor estructura');
    score -= 10;
  }

  // Check meta tags
  if (titleLength === 0 || titleLength > 60) {
    suggestions.push('Optimizar meta title (50-60 caracteres)');
    score -= 15;
  }

  if (descriptionLength === 0 || descriptionLength > 160) {
    suggestions.push('Optimizar meta description (120-160 caracteres)');
    score -= 15;
  }

  // Check images
  if (totalImages > 0 && imageAltTags < totalImages) {
    suggestions.push(`Agregar alt text a ${totalImages - imageAltTags} imágenes`);
    score -= 10;
  }

  // Check content length
  if (wordCount < 300) {
    suggestions.push('Contenido muy corto. Mínimo recomendado: 800 palabras');
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
          content: 'Eres un experto en SEO. Analiza el contenido y proporciona 3-5 sugerencias específicas y accionables para mejorar el ranking.'
        },
        {
          role: 'user',
          content: `Analiza este contenido para SEO:\n\n${plainText.slice(0, 2000)}\n\nPalabras clave objetivo: ${keywords.join(', ')}\n\nEstructura de encabezados: ${headingsCount} encabezados encontrados`
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
    improvements,
    metaAnalysis: {
      titleLength,
      descriptionLength,
      hasH1,
      headingsCount,
      imageAltTags
    }
  };
}

// Generate image suggestions using GPT-4
export async function generateImageSuggestions(content: string, count: number = 5): Promise<string[]> {
  const plainText = htmlToText(content).slice(0, 1500);
  
  const prompt = `Basándote en este contenido de artículo legal, sugiere ${count} descripciones detalladas de imágenes profesionales que mejorarían el artículo. Cada descripción debe ser específica y apropiada para generar con DALL-E:

${plainText}...

Proporciona las sugerencias como una lista numerada. Cada sugerencia debe incluir estilo, composición y elementos clave.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const suggestions = completion.choices[0].message.content || '';
    return suggestions
      .split('\n')
      .filter(s => s.trim().length > 0 && /^\d+\./.test(s.trim()))
      .map(s => s.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error('Failed to generate image suggestions:', error);
    return [];
  }
}

// Generate comprehensive SEO metadata
export async function generateMetadata(content: string, keywords: string[]): Promise<{
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  schema: string;
  canonicalUrl: string;
  focusKeyword: string;
  relatedKeywords: string[];
}> {
  const plainText = htmlToText(content).slice(0, 1500);
  
  try {
    const prompt = `Basándote en este contenido legal, genera metadata SEO completa y optimizada:

${plainText}...

Palabras clave principales: ${keywords.join(', ')}

Genera lo siguiente en formato JSON:
1. title: Meta title optimizado (50-60 caracteres, incluir keyword principal)
2. description: Meta description persuasiva (150-160 caracteres)
3. ogTitle: Open Graph title (puede ser más descriptivo)
4. ogDescription: Open Graph description (más detallada)
5. canonicalUrl: URL sugerida (slug SEO-friendly)
6. focusKeyword: Palabra clave principal de enfoque
7. relatedKeywords: Array de 5 keywords relacionadas
8. schema: Schema.org JSON-LD para Article con todos los campos necesarios

Responde SOLO con JSON válido.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en SEO y metadata. Responde solo con JSON válido, sin texto adicional.'
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
      schema: JSON.stringify(metadata.schema, null, 2) || '{}',
      canonicalUrl: metadata.canonicalUrl || '',
      focusKeyword: metadata.focusKeyword || keywords[0] || '',
      relatedKeywords: metadata.relatedKeywords || []
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: '',
      description: '',
      ogTitle: '',
      ogDescription: '',
      schema: '{}',
      canonicalUrl: '',
      focusKeyword: keywords[0] || '',
      relatedKeywords: []
    };
  }
}

// Batch content generation for multiple topics
export async function batchGenerateContent(
  topics: Array<{ prompt: string; keywords: string }>,
  baseParams: Omit<ContentGenerationParams, 'prompt' | 'keywords'>
): Promise<Array<{ topic: string; content: string; metadata?: any; error?: string }>> {
  const results = [];

  for (const topic of topics) {
    try {
      const content = await generateContent({
        ...baseParams,
        prompt: topic.prompt,
        keywords: topic.keywords
      });
      
      // Generate metadata for each piece
      const metadata = await generateMetadata(content, topic.keywords.split(',').map(k => k.trim()));
      
      results.push({ 
        topic: topic.prompt, 
        content,
        metadata 
      });
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

// Generate content variations for A/B testing
export async function generateContentVariations(
  basePrompt: string,
  keywords: string,
  variations: number = 3
): Promise<Array<{ version: string; content: string; tone: string }>> {
  const tones = [
    'professional-empathetic',
    'authoritative-confident',
    'friendly-conversational',
    'urgent-compelling',
    'educational-informative'
  ];
  
  const results = [];
  
  for (let i = 0; i < Math.min(variations, tones.length); i++) {
    try {
      const content = await generateContent({
        campaignId: '1',
        template: 'article',
        prompt: basePrompt,
        keywords,
        wordCount: 1000,
        creativity: 0.7,
        includeImages: false,
        includeSEO: true,
        tone: tones[i],
        language: 'es'
      });
      
      results.push({
        version: `Variación ${i + 1}`,
        content,
        tone: tones[i]
      });
    } catch (error) {
      console.error(`Error generating variation ${i + 1}:`, error);
    }
  }
  
  return results;
}

// Check OpenAI API health
export async function checkAPIHealth(): Promise<{ healthy: boolean; model: string; latency?: number }> {
  const startTime = Date.now();
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5
    });
    
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      model: completion.model,
      latency
    };
  } catch (error) {
    console.error('OpenAI API health check failed:', error);
    return {
      healthy: false,
      model: 'unavailable'
    };
  }
}

// Translate content to multiple languages
export async function translateContent(content: string, targetLanguages: string[]): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};
  
  for (const lang of targetLanguages) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: 'system',
            content: `Eres un traductor profesional especializado en contenido legal. Traduce el siguiente contenido al ${lang}, manteniendo el formato HTML y el tono profesional.`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.3
      });
      
      translations[lang] = completion.choices[0].message.content || '';
    } catch (error) {
      console.error(`Translation error for ${lang}:`, error);
      translations[lang] = '';
    }
  }
  
  return translations;
}
