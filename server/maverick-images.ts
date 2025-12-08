
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  seed?: number;
}

export async function generateImages(request: ImageGenerationRequest): Promise<GeneratedImage[]> {
  const {
    prompt,
    negativePrompt = 'blurry, low quality, distorted, watermark, text',
    width = 1024,
    height = 1024,
    numOutputs = 1,
    guidanceScale = 7.5,
    numInferenceSteps = 50,
  } = request;

  try {
    // Using Stable Diffusion XL via Replicate
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width,
          height,
          num_outputs: numOutputs,
          guidance_scale: guidanceScale,
          num_inference_steps: numInferenceSteps,
          scheduler: "K_EULER",
        },
      }
    ) as string[];

    return output.map((url, index) => ({
      url,
      prompt,
      seed: Date.now() + index,
    }));
  } catch (error: any) {
    console.error('Error generating images with Maverick/Replicate:', error);
    throw new Error(`Failed to generate images: ${error.message}`);
  }
}

export async function generateCampaignImages(
  campaignTheme: string,
  keywords: string[],
  imageCount: number = 3
): Promise<GeneratedImage[]> {
  const enhancedPrompt = `Professional, high-quality image for legal services blog about ${campaignTheme}. Keywords: ${keywords.join(', ')}. Style: modern, professional, trustworthy, clean composition, suitable for law firm website`;

  return generateImages({
    prompt: enhancedPrompt,
    negativePrompt: 'cartoon, anime, low quality, blurry, distorted faces, watermark, text, logo, signature',
    width: 1200,
    height: 630, // Optimal for blog featured images
    numOutputs: imageCount,
    guidanceScale: 8,
    numInferenceSteps: 50,
  });
}

export async function generateBlogHeaderImage(
  title: string,
  keywords: string[]
): Promise<string> {
  const prompt = `Professional header image for blog post titled "${title}". Keywords: ${keywords.join(', ')}. Style: modern, clean, high-quality, professional photography, suitable for law firm blog`;

  const images = await generateImages({
    prompt,
    width: 1200,
    height: 630,
    numOutputs: 1,
    guidanceScale: 8,
  });

  return images[0].url;
}

export async function generateSocialMediaImages(
  contentTitle: string,
  keywords: string[]
): Promise<{ facebook: string; twitter: string; linkedin: string }> {
  const basePrompt = `Professional social media image for "${contentTitle}". Keywords: ${keywords.join(', ')}. Style: modern, clean, eye-catching, professional`;

  // Facebook/LinkedIn (1200x630)
  const facebookImages = await generateImages({
    prompt: `${basePrompt}, optimized for Facebook and LinkedIn`,
    width: 1200,
    height: 630,
    numOutputs: 1,
  });

  // Twitter (1200x675)
  const twitterImages = await generateImages({
    prompt: `${basePrompt}, optimized for Twitter`,
    width: 1200,
    height: 675,
    numOutputs: 1,
  });

  return {
    facebook: facebookImages[0].url,
    twitter: twitterImages[0].url,
    linkedin: facebookImages[0].url, // Same as Facebook
  };
}
