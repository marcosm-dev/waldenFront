/**
 * WordPress REST API Service
 *
 * Generic service to fetch any WordPress REST API endpoint dynamically.
 *
 * Usage:
 *   import { wordpress } from '@/lib/wordpress';
 *
 *   // Fetch pages
 *   const { data: pages } = await wordpress.fetch('pages');
 *
 *   // Fetch posts with params
 *   const { data: posts } = await wordpress.fetch('posts', { per_page: 10, _embed: true });
 *
 *   // Fetch single item by slug
 *   const about = await wordpress.fetchOne('pages', { slug: 'about' });
 *
 *   // Fetch by ID
 *   const media = await wordpress.fetch('media/123');
 */

import type { WPFetchResponse, WPParams } from './types';

const WORDPRESS_URL = import.meta.env.WORDPRESS_URL;

if (!WORDPRESS_URL) {
  console.warn('WORDPRESS_URL environment variable is not set');
}

export const wordpress = {
  /**
   * Fetch data from any WordPress REST API endpoint
   *
   * @param endpoint - The API endpoint (e.g., 'posts', 'pages', 'media', 'categories')
   * @param params - Optional query parameters
   * @returns Promise with data array, total count, and total pages
   *
   * @example
   * // Get all pages
   * const { data } = await wordpress.fetch('pages');
   *
   * @example
   * // Get posts with pagination and embedded data
   * const { data, total, totalPages } = await wordpress.fetch('posts', {
   *   page: 1,
   *   per_page: 10,
   *   _embed: true
   * });
   *
   * @example
   * // Filter by category
   * const { data } = await wordpress.fetch('posts', { categories: [5, 10] });
   */
  async fetch<T = unknown>(
    endpoint: string,
    params?: WPParams
  ): Promise<WPFetchResponse<T>> {
    const baseUrl = WORDPRESS_URL || '';
    const url = new URL(`${baseUrl}/wp-json/wp/v2/${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle arrays (e.g., categories: [1, 2])
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data: Array.isArray(data) ? data : [data],
        total: Number(response.headers.get('X-WP-Total') || (Array.isArray(data) ? data.length : 1)),
        totalPages: Number(response.headers.get('X-WP-TotalPages') || 1),
      };
    } catch (error) {
      console.error(`Failed to fetch from WordPress: ${endpoint}`, error);
      throw error;
    }
  },

  /**
   * Fetch a single item from WordPress REST API
   *
   * @param endpoint - The API endpoint
   * @param params - Optional query parameters
   * @returns Promise with single item or null if not found
   *
   * @example
   * // Get page by slug
   * const about = await wordpress.fetchOne('pages', { slug: 'about' });
   *
   * @example
   * // Get post by ID
   * const post = await wordpress.fetchOne('posts/123');
   */
  async fetchOne<T = unknown>(
    endpoint: string,
    params?: WPParams
  ): Promise<T | null> {
    const { data } = await this.fetch<T>(endpoint, params);
    return data[0] || null;
  },

  /**
   * Get the configured WordPress URL
   */
  getBaseUrl(): string {
    return WORDPRESS_URL || '';
  },
};

// Re-export types for convenience
export type {
  WPFetchResponse,
  WPParams,
  WPPost,
  WPPage,
  WPMedia,
  WPCategory,
  WPTag,
  WPAuthor,
  WPRenderedContent,
  WPEmbedded,
} from './types';
