
import OpenAI from 'openai';

// This will use the OPENAI_API_KEY from environment variables
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
}

export async function generateContent(params: ContentGenerationParams): Promise<string> {
  const {
    prompt,
    keywords,
    wordCount,
    creativity,
    includeSEO
  } = params;

  const systemPrompt = `You are an expert SEO content writer specializing in personal injury law. 
Your task is to create comprehensive, well-structured, and SEO-optimized articles.
${includeSEO ? 'Include proper heading structure (H2, H3), internal linking suggestions, and keyword optimization.' : ''}
Write in a professional yet empathetic tone suitable for potential legal clients.`;

  const userPrompt = `Create a ${wordCount}-word article about: ${prompt}

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
      max_tokens: Math.ceil(wordCount * 1.5) // Approximate token count
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate content with OpenAI');
  }
}

export async function optimizeSEO(content: string, keywords: string[]): Promise<{
  score: number;
  suggestions: string[];
  keywordDensity: Record<string, number>;
}> {
  // Analyze content for SEO optimization
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

  return {
    score: Math.max(0, score),
    suggestions,
    keywordDensity
  };
}

export async function generateImageSuggestions(content: string): Promise<string[]> {
  const prompt = `Based on this article content, suggest 3-5 relevant image descriptions that would enhance the article:

${content.slice(0, 1000)}...

Provide image suggestions as a simple array of descriptions.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
