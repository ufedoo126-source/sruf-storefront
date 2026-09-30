'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { product } from '../../../sanity/schemaTypes/product';
import { collection } from '../../../sanity/schemaTypes/collection';

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