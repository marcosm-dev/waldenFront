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
