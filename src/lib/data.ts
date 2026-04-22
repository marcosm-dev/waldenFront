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
	/** Dimensiones del original (Strapi Media Library), útiles para astro:assets */
	width?: number;
	height?: number;
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
	/** Strapi devuelve el precio como número (ej: 47.5). Aceptamos string por compatibilidad. */
	price: number | string;
	description: string | null;
}

/**
 * Entrada del array `plans`. Cada entrada contiene UN único plan
 * (no un grupo / no un array). El `name` del nivel superior suele
 * coincidir con `plan.title` y se usa como etiqueta organizativa
 * desde el CMS.
 */
export interface StrapiPricingGroup {
	documentId: string;
	name: string;
	plan: StrapiPricingPlan;
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
	/**
	 * Dos niveles: grupos de planes → planes individuales.
	 * Ej: [{ name: "Individual", plan: [...] }, { name: "Grupos", plan: [...] }]
	 */
	plans: StrapiPricingGroup[];
	details: StrapiPricingDetail[];
}

// ============================================
// EXPERIENCES: ENUMS
// ============================================

/**
 * Valores canónicos para el campo `difficulty` de una Experience.
 * Son los strings que debe devolver Strapi (tipo Enumeration con
 * estos tres valores exactos).
 */
export enum ExperienceDifficulty {
	EASY = 'easy',
	MODERATE = 'moderate',
	HARD = 'hard',
}

/** Etiquetas legibles para mostrar al usuario */
export const ExperienceDifficultyLabels: Record<ExperienceDifficulty, string> = {
	[ExperienceDifficulty.EASY]: 'Fácil',
	[ExperienceDifficulty.MODERATE]: 'Moderada',
	[ExperienceDifficulty.HARD]: 'Difícil',
};

/**
 * Convierte cualquier valor recibido de Strapi (enum o string legacy)
 * a la etiqueta legible. Si el valor no coincide con ningún enum,
 * devuelve el string original (útil para mocks con "Todos los niveles",
 * "Moderada", etc.).
 */
export function getDifficultyLabel(value: string | null | undefined): string {
	if (!value) return '';
	if (value in ExperienceDifficultyLabels) {
		return ExperienceDifficultyLabels[value as ExperienceDifficulty];
	}
	return value;
}

/**
 * Normaliza un valor de precio (puede venir como "47.5", 47.5, null, "")
 * a un number. Devuelve null si no es un precio válido.
 */
function toNumericPrice(value: number | string | null | undefined): number | null {
	if (value == null || value === '') return null;
	const n = typeof value === 'string' ? parseFloat(value) : value;
	return Number.isFinite(n) ? n : null;
}

export interface StartingPrice {
	/** Precio a mostrar (mínimo de los planes, o precio único si no hay planes). */
	amount: number | null;
	/**
	 * true cuando el precio proviene de un rango de planes (≥ 2 precios distintos).
	 * Se usa para pintar "desde X€" en lugar de "X€".
	 */
	isStartingFrom: boolean;
}

/**
 * Calcula el precio a mostrar en la tarjeta de reserva:
 *   • Si la experiencia tiene varios planes con precios distintos,
 *     devuelve el mínimo y marca `isStartingFrom = true` (→ "desde X€").
 *   • Si todos los planes tienen el mismo precio (o solo hay uno),
 *     devuelve ese precio sin marca de "desde".
 *   • Si no hay planes, cae al campo `price` de la Experience.
 *   • Si tampoco hay `price`, devuelve `amount: null` para que la
 *     página pueda ocultar el bloque.
 */
export function getStartingPrice(experience: {
	plans?: StrapiExperiencePlan[] | null;
	price?: number | string | null;
}): StartingPrice {
	const planPrices =
		experience.plans
			?.map((p) => toNumericPrice(p?.price))
			.filter((n): n is number => n !== null) ?? [];

	if (planPrices.length > 0) {
		const min = Math.min(...planPrices);
		const max = Math.max(...planPrices);
		return { amount: min, isStartingFrom: min !== max };
	}

	return { amount: toNumericPrice(experience.price ?? null), isStartingFrom: false };
}

// Experiences de Strapi
export interface StrapiExperienceDetail {
	id: string;
	description: string;
	icon: string;
	image: StrapiImage | null;
}

/**
 * Plan asociado a una Experience. Asumimos una relación plana
 * (Experience → Plans) con al menos `price`. Si en Strapi la
 * relación llega anidada como `{ plan: { ... } }` (igual que en
 * la section Pricing) aplana el resultado antes de pasarlo al
 * helper, o ajusta esta interface.
 */
export interface StrapiExperiencePlan {
	id?: string;
	documentId?: string;
	title?: string | null;
	subtitle?: string | null;
	description?: string | null;
	price: number | string | null;
}

export interface StrapiExperience {
	documentId: string;
	name: string;
	slug: string;
	details: StrapiExperienceDetail[];
	/**
	 * Planes asociados (opcional). Cuando existen, la página de
	 * detalle muestra "desde {min price} / persona" en vez del
	 * precio único.
	 */
	plans?: StrapiExperiencePlan[] | null;
	/**
	 * Campos extendidos para la página de detalle.
	 * Todos opcionales: si no están definidos todavía en Strapi
	 * la página usa valores por defecto para no romperse.
	 */
	tagline?: string | null;
	longDescription?: string | null;
	price?: number | string | null;
	duration?: string | null;
	/**
	 * Idealmente uno de los valores de `ExperienceDifficulty` (si Strapi
	 * lo tiene configurado como Enumeration), pero aceptamos `string`
	 * para no romper mocks o datos antiguos. Usa `getDifficultyLabel()`
	 * para mostrarlo al usuario.
	 */
	difficulty?: ExperienceDifficulty | string | null;
	groupSize?: string | null;
	highlights?: Array<{ id?: string; text: string }> | null;
	includes?: Array<{ id?: string; text: string }> | null;
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
		Pricing {
      description
      details {
        desc
        icon
        id
        title
      }
      id
      subtitle
      title
      plans {
        name
        documentId
        plan {
          description
          id
          price
          subtitle
          title
        }
      }
    }
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
	return data?.home || null;
}

// ============================================
// QUERIES PARA EXPERIENCES (collection type)
// ============================================

/**
 * Fragmento de campos usado tanto en la query por slug
 * como en la lista "otras experiencias". Incluye los campos
 * extendidos (tagline, highlights, etc.) pero todos son
 * opcionales en Strapi: si no existen aún, el servidor los
 * devolverá como null/undefined y la página usará defaults.
 */
/**
 * Campos del content-type `Experience` en Strapi.
 *
 * FIELDS PENDIENTES DE CONFIRMAR / ACTIVAR:
 *   plans  (relación a los planes de Pricing — muchos-a-muchos o
 *           componente repeatable). Cuando me confirmes el nombre
 *           y forma exacta de la relación, descomenta el bloque de
 *           abajo y ajusta la forma si es necesario. Mientras tanto
 *           `experiences-mock.ts` puede simular `plans` si quieres
 *           ver el "desde XX€" en local.
 *
 *   Variante A — relación directa (si en Strapi añadiste Experience →
 *   Plan como many-to-many / one-to-many):
 *     plans {
 *       id
 *       title
 *       price
 *     }
 *
 *   Variante B — mismo componente anidado que Pricing (plans[].plan):
 *     plans {
 *       name
 *       documentId
 *       plan {
 *         id
 *         title
 *         price
 *       }
 *     }
 *   Si usas esta variante, habrá que aplanar antes de pasarlo a
 *   `getStartingPrice()`.
 */
const EXPERIENCE_FIELDS = `
  documentId
  name
  slug
  tagline
  longDescription
  duration
  difficulty
  groupSize
  highlights {
    id
    text
  }
  includes {
    id
    text
  }
  details {
    id
    description
    icon
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
`;

const EXPERIENCE_BY_SLUG_QUERY = (slug: string) => `
query {
  experiences(filters: { slug: { eq: "${slug}" } }) {
    ${EXPERIENCE_FIELDS}
  }
}
`;

const ALL_EXPERIENCES_QUERY = `
query {
  experiences {
    ${EXPERIENCE_FIELDS}
  }
}
`;

/**
 * Devuelve una experiencia por su slug, o null si no existe.
 * Si la query directa falla, hace fallback al listado completo.
 */
export async function getExperienceBySlug(
	slug: string,
): Promise<StrapiExperience | null> {
	if (!slug) return null;
	const data = await graphqlFetch<{ experiences: StrapiExperience[] }>(
		EXPERIENCE_BY_SLUG_QUERY(slug),
	);
	const direct = data?.experiences?.[0];
	if (direct) return direct;

	const all = await getAllExperiences();
	return all.find((e) => e.slug === slug) ?? null;
}

/**
 * Devuelve todas las experiencias. Útil para getStaticPaths y
 * para la sección "otras experiencias".
 *
 * Fallback: si la query directa al collection type `experiences`
 * falla (p.ej. el nombre es distinto en tu Strapi), intenta leer
 * las experiencias a través de `home.Experiences`, que sí sabemos
 * que funciona porque es la que usa la home.
 */
export async function getAllExperiences(): Promise<StrapiExperience[]> {
	const direct = await graphqlFetch<{ experiences: StrapiExperience[] }>(
		ALL_EXPERIENCES_QUERY,
	);
	if (direct?.experiences && direct.experiences.length > 0) {
		return direct.experiences;
	}

	console.warn(
		'[Strapi] `experiences` query vacía o fallida — usando fallback home.Experiences',
	);
	const home = await getHome();
	return home?.Experiences ?? [];
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
