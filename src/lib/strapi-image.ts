import type { StrapiSlide } from "./data";

/**
 * URL por defecto para <img src>: prioriza formatos generados en Strapi (más ligeros)
 * antes que el original. El srcset sigue incluyendo el original para pantallas grandes.
 * Los formatos y tamaños se configuran en Strapi (plugin upload + sharp), no en R2.
 */
export function getStrapiImageDefaultSrc(slide: StrapiSlide): string {
	if (!slide.image) return "/images/01.jpg";
	const { formats, url } = slide.image;
	return (
		formats?.medium?.url ||
		formats?.large?.url ||
		formats?.small?.url ||
		url
	);
}

/** URL absoluta del primer slide (misma que el `src` inicial del hero) para preload en BaseHead. */
export function getFirstHeroImagePreloadHref(
	slides: StrapiSlide[] | undefined,
): string | undefined {
	const first = slides?.[0];
	if (!first) return undefined;
	const href = getStrapiImageDefaultSrc(first);
	return href.startsWith("http") ? href : undefined;
}
