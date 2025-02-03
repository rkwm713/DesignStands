import { defineCollection, z } from 'astro:content';

const sections = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    lastUpdated: z.date(),
  }),
});

export const collections = {
  sections: sections,
};