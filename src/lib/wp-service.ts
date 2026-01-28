/**
 * Servicio para consumir páginas de WordPress
 * Obtiene una página por slug y devuelve sus datos para pintar
 */

import { getPageBySlug, getFeaturedImage, stripHtml, type WPPage } from './wordpress';
import type { AllPageData } from './mock-data';

// ============================================
// TIPOS
// ============================================

export interface PageData {
	id: number;
	slug: string;
	title: string;
	content: string;
	excerpt?: string;
	image?: {
		url: string;
		alt: string;
		width: number;
		height: number;
	};
	acf?: Record<string, unknown>;
	raw: WPPage;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

/**
 * Obtiene una página de WordPress por su slug
 */
export async function getPage(slug: string): Promise<PageData | null> {
	try {
		const page = await getPageBySlug(slug);

		if (!page) {
			console.warn(`[WPService] Página "${slug}" no encontrada`);
			return null;
		}
		console.log(page)


		const featuredImage = getFeaturedImage(page, 'large');

		return {
			id: page.id,
			slug: page.slug,
			title: stripHtml(page.title.rendered),
			content: page.content.rendered,
			excerpt: page.excerpt?.rendered ? stripHtml(page.excerpt.rendered) : undefined,
			image: featuredImage
				? {
						url: featuredImage.url,
						alt: featuredImage.alt,
						width: featuredImage.width,
						height: featuredImage.height,
					}
				: undefined,
			acf: (page as WPPage & { acf?: Record<string, unknown> }).acf,
			raw: page,
		};
	} catch (error) {
		console.error(`[WPService] Error obteniendo página "${slug}":`, error);
		return null;
	}
}

/**
 * Obtiene los datos de la página Home desde WordPress
 * y los mapea a la estructura que esperan los componentes
 *
 * Estructura esperada de ACF en la página "home":
 * - site_title, site_description
 * - hero_title, hero_subtitle, hero_description, hero_cta_primary, hero_cta_secondary
 * - hero_slides (repeater): title, subtitle, image
 * - philosophy_subtitle, philosophy_title, philosophy_description
 * - philosophy_items (repeater): icon, title, description
 * - testimonials_subtitle, testimonials_title, testimonials_description
 * - testimonials (repeater): name, location, experience, text, rating
 * - contact_title, contact_subtitle, contact_description, contact_email, contact_instagram, contact_location
 * - footer_description, footer_email, footer_instagram, footer_instagram_url, footer_copyright
 */
export async function getHomePageData(): Promise<AllPageData | null> {
	try {
		const page = await getPage('home');

		if (!page) {
			console.warn('[WPService] Página "home" no encontrada, usando datos mockeados');
			return null;
		}

		const acf = page.acf || {};

		// Mapear datos de ACF a la estructura de la app
		return {
			site: {
				title: (acf.site_title as string) || page.title,
				description: (acf.site_description as string) || page.excerpt || '',
			},
			nav: [
				{ href: '#experiences', label: 'Experiencias' },
				{ href: '#philosophy', label: 'Filosofía' },
				{ href: '#pricing', label: 'Precios' },
				{ href: '#testimonials', label: 'Opiniones' },
				{ href: '#contact', label: 'Contacto' },
			],
			hero: {
				title: (acf.hero_title as string) || '',
				subtitle: (acf.hero_subtitle as string) || '',
				description: (acf.hero_description as string) || '',
				ctaPrimary: (acf.hero_cta_primary as string) || 'Descubre nuestras experiencias',
				ctaSecondary: (acf.hero_cta_secondary as string) || 'Contactar',
				slides: mapHeroSlides(acf.hero_slides),
			},
			experiences: mapExperiences(acf.experiences),
			philosophy: {
				subtitle: (acf.philosophy_subtitle as string) || '',
				title: (acf.philosophy_title as string) || '',
				description: (acf.philosophy_description as string) || '',
				items: mapPhilosophyItems(acf.philosophy_items),
			},
			pricing: {
				subtitle: (acf.pricing_subtitle as string) || 'Precios por persona',
				title: (acf.pricing_title as string) || 'Elige tu experiencia',
				description: (acf.pricing_description as string) || '',
				experiences: mapPricingExperiences(acf.pricing_experiences),
				details: mapPricingDetails(acf.pricing_details),
			},
			testimonials: {
				subtitle: (acf.testimonials_subtitle as string) || '',
				title: (acf.testimonials_title as string) || '',
				description: (acf.testimonials_description as string) || '',
				testimonials: mapTestimonials(acf.testimonials),
			},
			contact: {
				subtitle: (acf.contact_subtitle as string) || 'Contacto',
				title: (acf.contact_title as string) || '',
				description: (acf.contact_description as string) || '',
				email: (acf.contact_email as string) || '',
				phone: (acf.contact_phone as string) || '',
				whatsapp: (acf.contact_whatsapp as string) || '',
				instagram: (acf.contact_instagram as string) || '',
				instagramUrl: (acf.contact_instagram_url as string) || '',
				location: (acf.contact_location as string) || '',
			},
			footer: {
				description: (acf.footer_description as string) || '',
				email: (acf.footer_email as string) || (acf.contact_email as string) || '',
				instagram: (acf.footer_instagram as string) || (acf.contact_instagram as string) || '',
				instagramUrl: (acf.footer_instagram_url as string) || (acf.contact_instagram_url as string) || '',
				copyright: (acf.footer_copyright as string) || `© ${new Date().getFullYear()} Walden Adventures GC`,
			},
		};
	} catch (error) {
		console.error('[WPService] Error obteniendo datos de home:', error);
		return null;
	}
}

// ============================================
// MAPPERS - Transforman datos de ACF a estructura de componentes
// ============================================

interface ACFHeroSlide {
	title?: string;
	subtitle?: string;
	image?: { url?: string; alt?: string } | string;
}

function mapHeroSlides(slides: unknown): AllPageData['hero']['slides'] {
	if (!Array.isArray(slides)) return [];

	return slides.map((slide: ACFHeroSlide, index: number) => ({
		title: slide.title || '',
		subtitle: slide.subtitle || '',
		image: typeof slide.image === 'string' ? slide.image : slide.image?.url || `/images/0${index + 1}.jpg`,
		alt: typeof slide.image === 'object' ? slide.image?.alt || slide.title || '' : slide.title || '',
	}));
}

interface ACFExperience {
	title?: string;
	description?: string;
	image?: { url?: string } | string;
	icon?: string;
}

function mapExperiences(experiences: unknown): AllPageData['experiences'] {
	if (!Array.isArray(experiences)) return [];

	return experiences.map((exp: ACFExperience, index: number) => ({
		id: index + 1,
		title: exp.title || '',
		description: exp.description || '',
		image: typeof exp.image === 'string' ? exp.image : exp.image?.url || `/images/0${index + 1}.jpg`,
		icon: (exp.icon as 'mountain' | 'waves' | 'wind' | 'utensils') || 'mountain',
	}));
}

interface ACFPhilosophyItem {
	icon?: string;
	title?: string;
	description?: string;
}

function mapPhilosophyItems(items: unknown): AllPageData['philosophy']['items'] {
	if (!Array.isArray(items)) return [];

	return items.map((item: ACFPhilosophyItem) => ({
		icon: (item.icon as 'heart' | 'users' | 'leaf' | 'clock') || 'heart',
		title: item.title || '',
		description: item.description || '',
	}));
}

interface ACFPricingExperience {
	name?: string;
	price?: string;
	description?: string;
}

function mapPricingExperiences(experiences: unknown): AllPageData['pricing']['experiences'] {
	if (!Array.isArray(experiences)) return [];

	return experiences.map((exp: ACFPricingExperience, index: number) => ({
		id: index + 1,
		name: exp.name || '',
		price: exp.price || '0',
		description: exp.description || '',
	}));
}

interface ACFPricingDetail {
	icon?: string;
	title?: string;
	description?: string;
}

function mapPricingDetails(details: unknown): AllPageData['pricing']['details'] {
	if (!Array.isArray(details)) return [];

	return details.map((detail: ACFPricingDetail) => ({
		icon: (detail.icon as 'calendar' | 'users' | 'credit-card') || 'calendar',
		title: detail.title || '',
		description: detail.description || '',
	}));
}

interface ACFTestimonial {
	name?: string;
	location?: string;
	experience?: string;
	text?: string;
	rating?: number;
	date?: string;
	avatar?: { url?: string } | string;
}

function mapTestimonials(testimonials: unknown): AllPageData['testimonials']['testimonials'] {
	if (!Array.isArray(testimonials)) return [];

	return testimonials.map((t: ACFTestimonial, index: number) => ({
		id: index + 1,
		name: t.name || '',
		location: t.location || '',
		experience: t.experience || '',
		text: t.text || '',
		rating: t.rating || 5,
		date: t.date || '',
		avatar: typeof t.avatar === 'string' ? t.avatar : t.avatar?.url,
	}));
}
