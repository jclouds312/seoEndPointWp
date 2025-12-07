
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';

export interface ContentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixes: string[];
}

export interface HTMLStructure {
  hasH1: boolean;
  headingHierarchy: boolean;
  hasParagraphs: boolean;
  hasLists: boolean;
  imageCount: number;
  linkCount: number;
  wordCount: number;
}

// Validate HTML content structure
export function validateContent(content: string): ContentValidation {
  const $ = cheerio.load(content);
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: string[] = [];

  // Check for H1
  const h1Count = $('h1').length;
  if (h1Count === 0) {
    errors.push('Falta encabezado H1');
    fixes.push('Agregar un encabezado H1 descriptivo al inicio del contenido');
  } else if (h1Count > 1) {
    warnings.push('Múltiples encabezados H1 encontrados');
    fixes.push('Mantener solo un H1 principal, convertir otros a H2 o H3');
  }

  // Check heading hierarchy
  let lastHeadingLevel = 0;
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const level = parseInt(elem.tagName.substring(1));
    if (level > lastHeadingLevel + 1 && lastHeadingLevel !== 0) {
      warnings.push(`Salto en jerarquía de encabezados: de H${lastHeadingLevel} a H${level}`);
    }
    lastHeadingLevel = level;
  });

  // Check for empty paragraphs
  $('p').each((i, elem) => {
    if ($(elem).text().trim().length === 0) {
      warnings.push('Párrafos vacíos encontrados');
      fixes.push('Eliminar párrafos vacíos');
    }
  });

  // Check for images without alt text
  const imagesWithoutAlt = $('img:not([alt])').length;
  if (imagesWithoutAlt > 0) {
    errors.push(`${imagesWithoutAlt} imágenes sin texto alternativo`);
    fixes.push('Agregar atributos alt descriptivos a todas las imágenes');
  }

  // Check for broken links
  $('a').each((i, elem) => {
    const href = $(elem).attr('href');
    if (!href || href === '#' || href === '') {
      warnings.push('Enlaces rotos o vacíos encontrados');
    }
  });

  // Check content length
  const plainText = htmlToText(content);
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount < 300) {
    warnings.push('Contenido muy corto (menos de 300 palabras)');
    fixes.push('Expandir el contenido a al menos 800 palabras para mejor SEO');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes
  };
}

// Analyze HTML structure
export function analyzeHTMLStructure(content: string): HTMLStructure {
  const $ = cheerio.load(content);
  const plainText = htmlToText(content);

  return {
    hasH1: $('h1').length > 0,
    headingHierarchy: checkHeadingHierarchy($),
    hasParagraphs: $('p').length > 0,
    hasLists: $('ul, ol').length > 0,
    imageCount: $('img').length,
    linkCount: $('a').length,
    wordCount: plainText.split(/\s+/).filter(w => w.length > 0).length
  };
}

// Check if heading hierarchy is correct
function checkHeadingHierarchy($: cheerio.CheerioAPI): boolean {
  let lastLevel = 0;
  let isValid = true;

  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const level = parseInt(elem.tagName.substring(1));
    if (level > lastLevel + 1 && lastLevel !== 0) {
      isValid = false;
    }
    lastLevel = level;
  });

  return isValid;
}

// Clean and format HTML content
export function cleanHTML(content: string): string {
  const $ = cheerio.load(content);

  // Remove empty paragraphs
  $('p').each((i, elem) => {
    if ($(elem).text().trim().length === 0) {
      $(elem).remove();
    }
  });

  // Remove multiple consecutive br tags
  $('br + br').remove();

  // Ensure proper spacing
  $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    if ($(elem).prev().is('h1, h2, h3, h4, h5, h6')) {
      $(elem).before('<br>');
    }
  });

  return $.html();
}

// Add internal linking suggestions
export function suggestInternalLinks(content: string, existingPages: Array<{ title: string; url: string; keywords: string[] }>): Array<{
  phrase: string;
  suggestedPage: { title: string; url: string };
  position: number;
}> {
  const suggestions: Array<{
    phrase: string;
    suggestedPage: { title: string; url: string };
    position: number;
  }> = [];

  const plainText = htmlToText(content).toLowerCase();

  existingPages.forEach(page => {
    page.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      const matches = plainText.matchAll(regex);

      for (const match of matches) {
        if (match.index !== undefined) {
          suggestions.push({
            phrase: keyword,
            suggestedPage: { title: page.title, url: page.url },
            position: match.index
          });
        }
      }
    });
  });

  // Sort by position and limit to top suggestions
  return suggestions
    .sort((a, b) => a.position - b.position)
    .slice(0, 5);
}

// Generate table of contents from headings
export function generateTableOfContents(content: string): Array<{
  id: string;
  text: string;
  level: number;
}> {
  const $ = cheerio.load(content);
  const toc: Array<{ id: string; text: string; level: number }> = [];

  $('h2, h3, h4').each((i, elem) => {
    const text = $(elem).text().trim();
    const level = parseInt(elem.tagName.substring(1));
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Add ID to heading if not present
    if (!$(elem).attr('id')) {
      $(elem).attr('id', id);
    }

    toc.push({ id, text, level });
  });

  return toc;
}

// Format content for specific platforms
export function formatForPlatform(content: string, platform: 'wordpress' | 'medium' | 'linkedin' | 'email'): string {
  const $ = cheerio.load(content);

  switch (platform) {
    case 'wordpress':
      // WordPress specific formatting
      $('img').each((i, elem) => {
        $(elem).wrap('<figure class="wp-block-image"></figure>');
        if ($(elem).attr('alt')) {
          $(elem).after(`<figcaption>${$(elem).attr('alt')}</figcaption>`);
        }
      });
      break;

    case 'medium':
      // Medium specific formatting (simpler HTML)
      $('strong').replaceWith((i, elem) => `<b>${$(elem).html()}</b>`);
      $('em').replaceWith((i, elem) => `<i>${$(elem).html()}</i>`);
      break;

    case 'linkedin':
      // LinkedIn strips most HTML, convert to plain text with line breaks
      return htmlToText(content, {
        wordwrap: false,
        preserveNewlines: true
      });

    case 'email':
      // Email-safe HTML
      $('*').each((i, elem) => {
        $(elem).removeAttr('class');
        $(elem).removeAttr('id');
      });
      break;
  }

  return $.html();
}

// Calculate estimated reading time
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): {
  minutes: number;
  seconds: number;
  text: string;
} {
  const plainText = htmlToText(content);
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const totalMinutes = wordCount / wordsPerMinute;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  let text = '';
  if (minutes > 0) {
    text = `${minutes} min`;
    if (seconds > 30) {
      text += ` ${seconds} seg`;
    }
  } else {
    text = `${seconds} seg`;
  }

  return { minutes, seconds, text };
}

// Extract meta information from content
export function extractMetaInfo(content: string): {
  firstParagraph: string;
  lastUpdated?: string;
  authorName?: string;
  categories: string[];
} {
  const $ = cheerio.load(content);
  
  const firstParagraph = $('p').first().text().trim();
  const categories: string[] = [];

  // Extract categories from meta tags if present
  $('meta[property="article:tag"]').each((i, elem) => {
    const category = $(elem).attr('content');
    if (category) categories.push(category);
  });

  return {
    firstParagraph: firstParagraph.slice(0, 200),
    categories
  };
}

export default {
  validateContent,
  analyzeHTMLStructure,
  cleanHTML,
  suggestInternalLinks,
  generateTableOfContents,
  formatForPlatform,
  calculateReadingTime,
  extractMetaInfo
};
