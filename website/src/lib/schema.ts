import type {
  WebSite,
  Organization,
  LocalBusiness,
  BlogPosting,
  BreadcrumbList,
  FAQPage,
  Person,
  WithContext,
} from 'schema-dts';
import siteConfig from '@/config/site.config';

/**
 * Create WebSite schema for homepage
 */
export function createWebsiteSchema(config?: {
  name?: string;
  url?: string;
  description?: string;
}): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config?.name || siteConfig.name,
    url: config?.url || siteConfig.url,
    description: config?.description || siteConfig.description,
  };
}

/**
 * Create Person schema
 */
export function createPersonSchema(author?: {
  name?: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
}): WithContext<Person> {
  const name = author?.name || siteConfig.author || siteConfig.name;
  const image =
    author?.image || (siteConfig.authorImage ? `${siteConfig.url}${siteConfig.authorImage}` : undefined);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: author?.url || siteConfig.url,
    ...(author?.jobTitle ? { jobTitle: author.jobTitle } : {}),
    ...(author?.description ? { description: author.description } : {}),
    ...(image ? { image } : {}),
    sameAs: author?.sameAs || siteConfig.socialLinks,
  };
}

/**
 * Create ProfessionalService schema for local SEO
 */
export function createProfessionalServiceSchema(config?: {
  name?: string;
  url?: string;
  email?: string;
  phone?: string;
  socialLinks?: string[];
  address?: {
    city?: string;
    country?: string;
  };
}): WithContext<LocalBusiness> {
  const name = config?.name || siteConfig.name;
  const url = config?.url || siteConfig.url;
  const email = config?.email || siteConfig.email;
  const phone = config?.phone || siteConfig.phone;
  const socialLinks = config?.socialLinks || siteConfig.socialLinks;
  const city = config?.address?.city || siteConfig.address?.city || 'Bogotá';
  const country = config?.address?.country || siteConfig.address?.country || 'CO';

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService' as 'LocalBusiness',
    name,
    url,
    email,
    ...(phone ? { telephone: phone } : {}),
    ...(siteConfig.authorImage ? { image: `${siteConfig.url}${siteConfig.authorImage}` } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'Bogotá, D.C.',
      addressCountry: country,
    },
    areaServed: [
      { '@type': 'Country', name: 'Colombia' },
      { '@type': 'Continent', name: 'Latin America' },
    ],
    sameAs: socialLinks,
  };
}

/**
 * Create Organization schema
 */
export function createOrganizationSchema(config?: {
  name?: string;
  url?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  socialLinks?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}): WithContext<Organization> {
  const name = config?.name || siteConfig.name;
  const url = config?.url || siteConfig.url;
  const logoUrl =
    config?.logoUrl ||
    (siteConfig.branding.logo.imageUrl
      ? `${siteConfig.url}${siteConfig.branding.logo.imageUrl}`
      : undefined);
  const socialLinks = config?.socialLinks || siteConfig.socialLinks;
  const phone = config?.phone || siteConfig.phone;
  const email = config?.email || siteConfig.email;
  const address = config?.address || siteConfig.address;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(email ? { email } : {}),
    ...(logoUrl ? { logo: logoUrl } : {}),
    sameAs: socialLinks,
    contactPoint: phone
      ? {
          '@type': 'ContactPoint',
          telephone: phone,
          contactType: 'customer service',
        }
      : undefined,
    ...(address?.city
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address.street,
            addressLocality: address.city,
            addressRegion: address.state,
            postalCode: address.zip,
            addressCountry: address.country,
          },
        }
      : {}),
  };
}

/**
 * Create BlogPosting schema for blog posts
 */
export function createBlogPostSchema(post: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  author: {
    name: string;
    url?: string;
    image?: string;
    jobTitle?: string;
    sameAs?: string[];
  };
  publisher?: {
    name?: string;
    logoUrl?: string;
  };
}): WithContext<BlogPosting> {
  const publisherName = post.publisher?.name || siteConfig.name;
  const publisherLogo =
    post.publisher?.logoUrl ||
    (siteConfig.branding.logo.imageUrl
      ? `${siteConfig.url}${siteConfig.branding.logo.imageUrl}`
      : undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    image: post.image,
    datePublished: post.datePublished.toISOString(),
    dateModified: post.dateModified?.toISOString() || post.datePublished.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.url ? { url: post.author.url } : {}),
      ...(post.author.image ? { image: post.author.image } : {}),
      ...(post.author.jobTitle ? { jobTitle: post.author.jobTitle } : {}),
      ...(post.author.sameAs && post.author.sameAs.length > 0 ? { sameAs: post.author.sameAs } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      ...(publisherLogo
        ? {
            logo: {
              '@type': 'ImageObject',
              url: publisherLogo,
            },
          }
        : {}),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
}

/**
 * Create BreadcrumbList schema
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Create FAQPage schema
 */
export function createFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
