/**
 * WordPress REST API Client para Astro
 * Consumo de páginas y posts desde WordPress con caché
 */

import { SITE_URL } from '../consts';

// Configuración de WordPress
const WP_API_URL = `${SITE_URL}/wp-json/wp/v2`;

// Cache en memoria para desarrollo (en producción se regenera en build time)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hora en milisegundos

// Tipos para la API de WordPress
export interface WPPost {
	id: number;
	date: string;
	date_gmt: string;
	modified: string;
	modified_gmt: string;
	slug: string;
	status: string;
	type: string;
	link: string;
	title: {
		rendered: string;
	};
	content: {
		rendered: string;
		protected: boolean;
	};
	excerpt: {
		rendered: string;
		protected: boolean;
	};
	author: number;
	featured_media: number;
	categories: number[];
	tags: number[];
	_embedded?: {
		'wp:featuredmedia'?: WPMedia[];
		author?: WPAuthor[];
	};
}

export interface WPPage {
	id: number;
	date: string;
	date_gmt: string;
	modified: string;
	modified_gmt: string;
	slug: string;
	status: string;
	type: string;
	link: string;
	title: {
		rendered: string;
	};
	content: {
		rendered: string;
		protected: boolean;
	};
	excerpt: {
		rendered: string;
		protected: boolean;
	};
	author: number;
	featured_media: number;
	parent: number;
	menu_order: number;
	template: string;
	_embedded?: {
		'wp:featuredmedia'?: WPMedia[];
		author?: WPAuthor[];
	};
}

export interface WPMedia {
	id: number;
	date: string;
	slug: string;
	type: string;
	link: string;
	title: {
		rendered: string;
	};
	alt_text: string;
	media_type: string;
	mime_type: string;
	source_url: string;
	media_details: {
		width: number;
		height: number;
		sizes: {
			[key: string]: {
				file: string;
				width: number;
				height: number;
				mime_type: string;
				source_url: string;
			};
		};
	};
}

export interface WPAuthor {
	id: number;
	name: string;
	url: string;
	description: string;
	slug: string;
	avatar_urls: {
		[key: string]: string;
	};
}

export interface WPCategory {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	parent: number;
}

export interface WPTag {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
}

// Función genérica para fetch con caché
async function fetchWithCache<T>(
	endpoint: string,
	params: Record<string, string | number | boolean> = {}
): Promise<T> {
	// Construir URL con parámetros
	const url = new URL(`${WP_API_URL}${endpoint}`);
	Object.entries(params).forEach(([key, value]) => {
		url.searchParams.append(key, String(value));
	});

	const cacheKey = url.toString();

	// Verificar caché
	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.data as T;
	}

	try {
		const response = await fetch(url.toString(), {
			headers: {
				'Accept': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		// Guardar en caché
		cache.set(cacheKey, { data, timestamp: Date.now() });

		return data as T;
	} catch (error) {
		console.error(`Error fetching ${endpoint}:`, error);
		throw error;
	}
}

// Limpiar caché (útil para webhook de invalidación)
export function clearCache(pattern?: string): void {
	if (pattern) {
		for (const key of cache.keys()) {
			if (key.includes(pattern)) {
				cache.delete(key);
			}
		}
	} else {
		cache.clear();
	}
}

// ============================================
// POSTS
// ============================================

export async function getPosts(options: {
	perPage?: number;
	page?: number;
	categories?: number[];
	tags?: number[];
	search?: string;
	orderBy?: 'date' | 'title' | 'id' | 'modified';
	order?: 'asc' | 'desc';
	embed?: boolean;
} = {}): Promise<WPPost[]> {
	const params: Record<string, string | number | boolean> = {
		per_page: options.perPage || 10,
		page: options.page || 1,
		orderby: options.orderBy || 'date',
		order: options.order || 'desc',
	};

	if (options.categories?.length) {
		params.categories = options.categories.join(',');
	}
	if (options.tags?.length) {
		params.tags = options.tags.join(',');
	}
	if (options.search) {
		params.search = options.search;
	}
	if (options.embed !== false) {
		params._embed = true;
	}

	return fetchWithCache<WPPost[]>('/posts', params);
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
	const posts = await fetchWithCache<WPPost[]>('/posts', {
		slug,
		_embed: true,
	});
	return posts[0] || null;
}

export async function getPostById(id: number): Promise<WPPost> {
	return fetchWithCache<WPPost>(`/posts/${id}`, { _embed: true });
}

// ============================================
// PAGES
// ============================================

export async function getPages(options: {
	perPage?: number;
	page?: number;
	parent?: number;
	search?: string;
	orderBy?: 'date' | 'title' | 'id' | 'menu_order';
	order?: 'asc' | 'desc';
	embed?: boolean;
} = {}): Promise<WPPage[]> {
	const params: Record<string, string | number | boolean> = {
		per_page: options.perPage || 100,
		page: options.page || 1,
		orderby: options.orderBy || 'menu_order',
		order: options.order || 'asc',
	};

	if (typeof options.parent === 'number') {
		params.parent = options.parent;
	}
	if (options.search) {
		params.search = options.search;
	}
	if (options.embed !== false) {
		params._embed = true;
	}

	return fetchWithCache<WPPage[]>('/pages', params);
}

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
	const pages = await fetchWithCache<WPPage[]>('/pages', {
		slug,
		_embed: true,
	});
	return pages[0] || null;
}

export async function getPageById(id: number): Promise<WPPage> {
	return fetchWithCache<WPPage>(`/pages/${id}`, { _embed: true });
}

// ============================================
// MEDIA
// ============================================

export async function getMedia(options: {
	perPage?: number;
	page?: number;
	mediaType?: 'image' | 'video' | 'audio' | 'application';
	mimeType?: string;
} = {}): Promise<WPMedia[]> {
	const params: Record<string, string | number> = {
		per_page: options.perPage || 100,
		page: options.page || 1,
	};

	if (options.mediaType) {
		params.media_type = options.mediaType;
	}
	if (options.mimeType) {
		params.mime_type = options.mimeType;
	}

	return fetchWithCache<WPMedia[]>('/media', params);
}

export async function getMediaById(id: number): Promise<WPMedia> {
	return fetchWithCache<WPMedia>(`/media/${id}`);
}

// ============================================
// CATEGORIES & TAGS
// ============================================

export async function getCategories(options: {
	perPage?: number;
	hideEmpty?: boolean;
} = {}): Promise<WPCategory[]> {
	return fetchWithCache<WPCategory[]>('/categories', {
		per_page: options.perPage || 100,
		hide_empty: options.hideEmpty !== false,
	});
}

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
	const categories = await fetchWithCache<WPCategory[]>('/categories', { slug });
	return categories[0] || null;
}

export async function getTags(options: {
	perPage?: number;
	hideEmpty?: boolean;
} = {}): Promise<WPTag[]> {
	return fetchWithCache<WPTag[]>('/tags', {
		per_page: options.perPage || 100,
		hide_empty: options.hideEmpty !== false,
	});
}

export async function getTagBySlug(slug: string): Promise<WPTag | null> {
	const tags = await fetchWithCache<WPTag[]>('/tags', { slug });
	return tags[0] || null;
}

// ============================================
// UTILIDADES
// ============================================

// Extraer imagen destacada de un post/página embebido
export function getFeaturedImage(
	item: WPPost | WPPage,
	size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'
): { url: string; alt: string; width: number; height: number } | null {
	const media = item._embedded?.['wp:featuredmedia']?.[0];
	if (!media) return null;

	const sizeData = media.media_details?.sizes?.[size];
	if (sizeData) {
		return {
			url: sizeData.source_url,
			alt: media.alt_text || item.title.rendered,
			width: sizeData.width,
			height: sizeData.height,
		};
	}

	// Fallback a la imagen original
	return {
		url: media.source_url,
		alt: media.alt_text || item.title.rendered,
		width: media.media_details?.width || 0,
		height: media.media_details?.height || 0,
	};
}

// Extraer autor de un post/página embebido
export function getAuthor(item: WPPost | WPPage): WPAuthor | null {
	return item._embedded?.author?.[0] || null;
}

// Limpiar HTML de WordPress para texto plano
export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#039;/g, "'")
		.trim();
}

// Formatear fecha de WordPress
export function formatDate(dateString: string, locale = 'es-ES'): string {
	const date = new Date(dateString);
	return date.toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

// ============================================
// CUSTOM POST TYPES - HERO SLIDES
// ============================================

export interface WPHeroSlide {
	id: number;
	title: { rendered: string };
	content: { rendered: string };
	featured_media: number;
	meta: {
		slide_subtitle?: string;
		slide_order?: number;
	};
	_embedded?: {
		'wp:featuredmedia'?: WPMedia[];
	};
}

/**
 * Obtiene los slides del hero desde WordPress
 * Requiere un CPT 'hero_slide' configurado en WordPress
 */
export async function getHeroSlides(): Promise<WPHeroSlide[]> {
	try {
		return await fetchWithCache<WPHeroSlide[]>('/hero_slide', {
			per_page: 10,
			orderby: 'menu_order',
			order: 'asc',
			_embed: true,
		});
	} catch (error) {
		console.warn('Hero slides CPT not found, using defaults');
		return [];
	}
}

// ============================================
// CUSTOM POST TYPES - TESTIMONIALS
// ============================================

export interface WPTestimonial {
	id: number;
	title: { rendered: string };
	content: { rendered: string };
	meta: {
		testimonial_experience?: string;
		testimonial_location?: string;
		testimonial_rating?: number;
		testimonial_date?: string;
	};
}

/**
 * Obtiene los testimonios desde WordPress
 * Requiere un CPT 'testimonial' configurado en WordPress
 */
export async function getTestimonials(): Promise<WPTestimonial[]> {
	try {
		return await fetchWithCache<WPTestimonial[]>('/testimonial', {
			per_page: 10,
			orderby: 'date',
			order: 'desc',
		});
	} catch (error) {
		console.warn('Testimonials CPT not found, using defaults');
		return [];
	}
}

// ============================================
// CUSTOM POST TYPES - EXPERIENCES
// ============================================

export interface WPExperience {
	id: number;
	title: { rendered: string };
	content: { rendered: string };
	featured_media: number;
	meta: {
		experience_icon?: string;
		experience_order?: number;
	};
	_embedded?: {
		'wp:featuredmedia'?: WPMedia[];
	};
}

/**
 * Obtiene las experiencias desde WordPress
 * Requiere un CPT 'experience' configurado en WordPress
 */
export async function getExperiences(): Promise<WPExperience[]> {
	try {
		return await fetchWithCache<WPExperience[]>('/experience', {
			per_page: 10,
			orderby: 'menu_order',
			order: 'asc',
			_embed: true,
		});
	} catch (error) {
		console.warn('Experiences CPT not found, using defaults');
		return [];
	}
}

// ============================================
// CUSTOM POST TYPES - PRICING
// ============================================

export interface WPPricing {
	id: number;
	title: { rendered: string };
	content: { rendered: string };
	meta: {
		pricing_price?: string;
		pricing_order?: number;
	};
}

/**
 * Obtiene los precios desde WordPress
 * Requiere un CPT 'pricing' configurado en WordPress
 */
export async function getPricing(): Promise<WPPricing[]> {
	try {
		return await fetchWithCache<WPPricing[]>('/pricing', {
			per_page: 10,
			orderby: 'menu_order',
			order: 'asc',
		});
	} catch (error) {
		console.warn('Pricing CPT not found, using defaults');
		return [];
	}
}

// ============================================
// SITE SETTINGS (via Options API or ACF)
// ============================================

export interface WPSiteSettings {
	hero_title?: string;
	hero_subtitle?: string;
	hero_description?: string;
	hero_cta_primary?: string;
	hero_cta_secondary?: string;
	contact_email?: string;
	contact_phone?: string;
	contact_whatsapp?: string;
	contact_instagram?: string;
	contact_location?: string;
}

/**
 * Obtiene las configuraciones del sitio desde WordPress
 * Requiere ACF Options Page o similar
 */
export async function getSiteSettings(): Promise<WPSiteSettings | null> {
	try {
		// Endpoint personalizado que necesitas crear en WordPress
		// usando register_rest_route o ACF to REST API
		return await fetchWithCache<WPSiteSettings>('/site-settings');
	} catch (error) {
		console.warn('Site settings not found, using defaults');
		return null;
	}
}
