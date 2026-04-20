// ============================================
// STRAPI GRAPHQL CLIENT
// ============================================

const STRAPI_URL = import.meta.env.STRAPI_URL || 'https://admin.walden-adventures.com';
const STRAPI_GRAPHQL_URL = `${STRAPI_URL}/graphql`;
const STRAPI_ACCESS_TOKEN = import.meta.env.STRAPI_ACCESS_TOKEN || "e55dcba9f8458a9576685677b949997cf1c549db7310ee69536deeaa48e215b4c3acbe14162b4878b67b7feec5ad8203ed17b6b9965a294918b979e3f0c549ee1a46bcd3991e252f54cdeeed5bd41734a0ef9fefda7b9cc0e1d062ef3bd51e3b615bc6ce13f696f6132e57021485fec1d591eb2ba3685c062bad2a7a10006f5f";

// ============================================
// TIPOS PARA STRAPI
// ============================================

export interface StrapiImage {
	alternativeText: string | null;
	name: string;
	url: string;
	formats: {
		thumbnail?: { url: string };
		small?: { url: string };
		medium?: { url: string };
		large?: { url: string };
	} | null;
}

export interface StrapiSlide {
	id: string;
	title: string;
	subtitle: string | null;
	description: string | null;
	image: StrapiImage | null;
}

// Componente Hero Banner de la Dynamic Zone
export interface ComponentHeroBanner {
	__typename?: 'ComponentHeroBanner';
	id: string;
	title: string;
	subtitle: string | null;
	description: string | null;
	ctaPrimary: string | null;
	ctaSecondary: string | null;
	ctaPrimaryHref: string | null;
	ctaSecondaryHref: string | null;
	slides: StrapiSlide[];
}

// Dynamic Zone Hero
export type HeroDynamicZone = ComponentHeroBanner;

// Pricing de Strapi (campo directo en Home)
export interface StrapiPricingPlan {
	id: string;
	title: string;
	subtitle: string | null;
	price: string;
	description: string | null;
}

export interface StrapiPricingDetail {
	id: string;
	title: string;
	icon: string | null;
	desc: string | null;
}

export interface StrapiPricing {
	id: string;
	title: string | null;
	subtitle: string | null;
	description: string | null;
	plan: StrapiPricingPlan[];
	details: StrapiPricingDetail[];
}

// Experiences de Strapi
export interface StrapiExperienceDetail {
	id: string;
	description: string;
	icon: string;
	image: StrapiImage | null;
}

export interface StrapiExperience {
	documentId: string;
	name: string;
	slug: string;
	details: StrapiExperienceDetail[];
}

// Filosofia de Strapi (campo directo en Home)
export interface StrapiFilosofiaItem {
	id: string;
	title: string | null;
	subtitle: string | null;
	description: string | null;
	icon: string | null;
	image: StrapiImage | null;
}

export interface StrapiFilosofiaColumn1 {
	id: string;
	title: string | null;
	subtitle: string | null;
	description: string | null;
	items: StrapiFilosofiaItem[];
}

export interface StrapiFilosofiaColumn2 {
	id: string;
	title: string | null;
	subtitle: string | null;
	description: string | null;
	icon: string | null;
	image: StrapiImage | null;
}

export interface StrapiFilosofia {
	id: string;
	column1: StrapiFilosofiaColumn1;
	column2: StrapiFilosofiaColumn2;
}

export interface StrapiHome {
	documentId: string;
	Hero: HeroDynamicZone[];
	Experiences: StrapiExperience[];
	Pricing: StrapiPricing | null;
	Filosofia: StrapiFilosofia | null;
}

// ============================================
// CLIENTE GRAPHQL
// ============================================

async function graphqlFetch<T>(query: string): Promise<T | null> {
	try {
		const response = await fetch(STRAPI_GRAPHQL_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${STRAPI_ACCESS_TOKEN}`,
			},
			body: JSON.stringify({ query }),
		});

		const result = await response.json();
		console.log(result)

		if (!response.ok) {
			
			console.error(`[Strapi] HTTP error: ${response.status}`, JSON.stringify(result, null, 2));
			return null;
		}

		if (result.errors?.length) {
			console.error('[Strapi] GraphQL errors:', JSON.stringify(result.errors, null, 2));
			if (result.data) {
				return result.data as T;
			}
			return null;
		}
		return result.data as T;
	} catch (error) {
		console.error('[Strapi] Fetch error:', error);
		return null;
	}
}

// ============================================
// QUERY PARA HOME
// ============================================

const HOME_QUERY = `
query {
  home {
    documentId
		Experiences {
      documentId
      details {
        description
        icon
        id
        image {
          documentId
          alternativeText
          caption
          width
          height
          formats
          ext
          size
          url
          updatedAt
          previewUrl
          name
        }
      }
      name
      slug
    }
    Pricing {
      id
      title
      subtitle
      description
      plan {
        id
        title
        subtitle
        price
        description
      }
      details {
        id
        title
        icon
        desc
      }
    }
    Filosofia {
      id
      column1 {
        id
        title
        subtitle
        description
        items {
          id
          title
          subtitle
          description
          icon
          image {
            alternativeText
            name
            url
            formats
          }
        }
      }
      column2 {
        id
        title
        subtitle
        description
        icon
        image {
          alternativeText
          name
          url
          formats
        }
      }
    }
    Hero {
      ... on ComponentHeroBanner {
        id
        title
        subtitle
        description
        ctaPrimary
        ctaSecondary
        ctaPrimaryHref
        ctaSecondaryHref
        slides {
          id
          title
          subtitle
          description
          image {
            alternativeText
            name
            url
            formats
          }
        }
      }
    }
  }
}
`;

// ============================================
// FUNCIONES DE ACCESO A DATOS
// ============================================

/**
 * Obtiene el single type "home" de Strapi
 */
export async function getHome(): Promise<StrapiHome | null> {
	const data = await graphqlFetch<{ home: StrapiHome }>(HOME_QUERY);
	console.log(JSON.stringify(data, null, 2));
	return data?.home || null;
}

/**
 * Helper para obtener la URL de imagen (usa el tamaño especificado o la original)
 */
export function getImageUrl(
	image: StrapiImage | null,
	size?: 'thumbnail' | 'small' | 'medium' | 'large'
): string {
	if (!image) return '/images/placeholder.jpg';
	if (size && image.formats?.[size]) {
		return image.formats[size]!.url;
	}
	return image.url;
}

// ============================================
// TIPOS PARA LA PÁGINA HOME
// ============================================

import {
	type SiteSettings,
	type NavLink,
	type TestimonialsData,
	type ContactData,
	type FooterData,
	siteSettings,
	navLinks,
	testimonialsData,
	contactData,
	footerData,
} from './mock-data';

export interface HomePageData {
	site: SiteSettings;
	nav: NavLink[];
	hero: ComponentHeroBanner | null;
	experiences: StrapiExperience[];
	philosophy: StrapiFilosofia | null;
	pricing: StrapiPricing | null;
	testimonials: TestimonialsData;
	contact: ContactData;
	footer: FooterData;
}

/**
 * Obtiene todos los datos de la página home
 */
export async function getPageData(): Promise<HomePageData> {
	const home = await getHome();

	console.log('[getPageData] Pricing:', JSON.stringify(home?.Pricing, null, 2));
	console.log('[getPageData] Filosofia:', JSON.stringify(home?.Filosofia, null, 2));

	return {
		site: siteSettings,
		nav: navLinks,
		hero: home?.Hero?.[0] ?? null,
		experiences: home?.Experiences ?? [],
		philosophy: home?.Filosofia ?? null,
		pricing: home?.Pricing ?? null,
		testimonials: testimonialsData,
		contact: contactData,
		footer: footerData,
	};
}
