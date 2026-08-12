import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const updates = defineCollection({
	loader: glob({ base: './src/content/updates', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		videoUrl: z.string().url().optional(),
		heroImage: z.string().optional(),
	}),
});

export const collections = { updates };
