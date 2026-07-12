import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let orgs: { slug: string; updatedAt: Date }[] = [];
  try {
    orgs = await prisma.organization.findMany({
      select: { slug: true, updatedAt: true },
    });
  } catch (error) {
    console.warn('Sitemap generation failed to query database:', error);
  }

  const orgUrls = orgs.map((org) => ({
    url: `${baseUrl}/status/${org.slug}`,
    lastModified: org.updatedAt,
    changeFrequency: 'always' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...orgUrls,
  ];
}
