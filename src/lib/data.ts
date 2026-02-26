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

// Dynamic Zone Hero - puede contener múltiples tipos de componentes
// Añade más tipos aquí si agregas otros componentes a la Dynamic Zone
export type HeroDynamicZone = ComponentHeroBanner; // | ComponentOtroTipo

export interface StrapiHome {
	documentId: string;
	Hero: HeroDynamicZone[];
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

		if (!response.ok) {
			console.error(`[Strapi] HTTP error: ${response.status}`, JSON.stringify(result, null, 2));
			return null;
		}

		if (result.errors?.length) {
			console.error('[Strapi] GraphQL errors:', JSON.stringify(result.errors, null, 2));
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
// INTEGRACIÓN CON MOCK DATA (FALLBACK)
// ============================================

import {
	type SiteSettings,
	type NavLink,
	type Experience,
	type PhilosophyData,
	type PricingData,
	type TestimonialsData,
	type ContactData,
	type FooterData,
	siteSettings,
	navLinks,
	heroData as mockHeroData,
	experiencesData,
	philosophyData,
	pricingData,
	testimonialsData,
	contactData,
	footerData,
} from './mock-data';

// ============================================
// TIPOS PARA LA PÁGINA HOME
// ============================================

export interface HomePageData {
	site: SiteSettings;
	nav: NavLink[];
	hero: HeroDynamicZone[];
	experiences: Experience[];
	philosophy: PhilosophyData;
	pricing: PricingData;
	testimonials: TestimonialsData;
	contact: ContactData;
	footer: FooterData;
}

/**
 * Obtiene todos los datos de la página home
 */
export async function getPageData(): Promise<HomePageData> {
	const home = await getHome();

	return {
		site: siteSettings,
		nav: navLinks,
		hero: home?.Hero ?? [mockHeroData as unknown as ComponentHeroBanner],
		experiences: experiencesData,
		philosophy: philosophyData,
		pricing: pricingData,
		testimonials: testimonialsData,
		contact: contactData,
		footer: footerData,
	};
}
