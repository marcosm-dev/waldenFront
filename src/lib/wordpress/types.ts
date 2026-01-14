/**
 * WordPress REST API Types
 */

// Response wrapper for fetch operations
export interface WPFetchResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}

// Generic params type for WordPress REST API
export type WPParams = Record<string, string | number | boolean | string[] | number[] | undefined>;

// Common WordPress rendered content structure
export interface WPRenderedContent {
  rendered: string;
  protected?: boolean;
}

// WordPress Post
export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: WPRenderedContent;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: WPRenderedContent;
  content: WPRenderedContent;
  excerpt: WPRenderedContent;
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, unknown>[];
  categories: number[];
  tags: number[];
  _embedded?: WPEmbedded;
}

// WordPress Page
export interface WPPage {
  id: number;
  date: string;
  date_gmt: string;
  guid: WPRenderedContent;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: 'page';
  link: string;
  title: WPRenderedContent;
  content: WPRenderedContent;
  excerpt: WPRenderedContent;
  author: number;
  featured_media: number;
  parent: number;
  menu_order: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: Record<string, unknown>[];
  _embedded?: WPEmbedded;
}

// WordPress Media
export interface WPMedia {
  id: number;
  date: string;
  date_gmt: string;
  guid: WPRenderedContent;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: WPRenderedContent;
  author: number;
  caption: WPRenderedContent;
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: WPMediaDetails;
  source_url: string;
}

export interface WPMediaDetails {
  width: number;
  height: number;
  file: string;
  filesize?: number;
  sizes: WPMediaSizes;
}

export interface WPMediaSize {
  file: string;
  width: number;
  height: number;
  filesize?: number;
  mime_type: string;
  source_url: string;
}

export interface WPMediaSizes {
  thumbnail?: WPMediaSize;
  medium?: WPMediaSize;
  medium_large?: WPMediaSize;
  large?: WPMediaSize;
  full: WPMediaSize;
  [key: string]: WPMediaSize | undefined;
}

// WordPress Category
export interface WPCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'category';
  parent: number;
  meta: Record<string, unknown>[];
}

// WordPress Tag
export interface WPTag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: 'post_tag';
  meta: Record<string, unknown>[];
}

// WordPress Author/User
export interface WPAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    '24': string;
    '48': string;
    '96': string;
  };
}

// Embedded data structure (when using _embed parameter)
export interface WPEmbedded {
  author?: WPAuthor[];
  'wp:featuredmedia'?: WPMedia[];
  'wp:term'?: (WPCategory | WPTag)[][];
}
