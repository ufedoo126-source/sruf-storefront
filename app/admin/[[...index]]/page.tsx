'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import product from '../../../sanity/schemas/product';
import collection from '../../../sanity/schemas/collection';

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  title: 'SRUF Brand Dashboard',
  basePath: '/admin',
  plugins: [structureTool()],
  schema: {
    types: [product, collection],
  },
});

export default function AdminPage() {
  return <NextStudio config={config} />;
}