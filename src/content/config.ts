import { defineCollection, z } from "astro:content";
// z -> zod schema

const writeups = defineCollection({
  schema: z.object({
    title: z.string(),
    os: z.string(),
    img: z.string(),
    plataforma: z.string(),
    dificultad: z.string(),
    skills: z.array(z.string()),
    description: z.string(),
  }),
})

export const collections = { writeups }
