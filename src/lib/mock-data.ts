/**
 * Datos mockeados que simulan la estructura de WordPress headless
 * Estos datos serán reemplazados por llamadas reales a la API de WordPress
 *
 * ============================================
 * GUÍA DE INTEGRACIÓN CON WORDPRESS HEADLESS
 * ============================================
 *
 * Para conectar Astro con WordPress como headless CMS:
 *
 * 1. CONFIGURAR WORDPRESS:
 *    - Instalar y activar plugins:
 *      • ACF (Advanced Custom Fields) - para campos personalizados
 *      • ACF to REST API - expone campos ACF en la REST API
 *      • WP REST API Controller - controla qué exponer
 *
 * 2. CREAR CUSTOM POST TYPES (CPTs):
 *    Usar un plugin como CPT UI o código en functions.php:
 *
 *    - hero_slide: Slides del hero
 *      • Campos: title, subtitle (ACF text), featured_media, menu_order
 *
 *    - testimonial: Testimonios
 *      • Campos: title (nombre), content (texto), experience (ACF text),
 *        location (ACF text), rating (ACF number)
 *
 *    - experience: Experiencias
 *      • Campos: title, content, featured_media, icon (ACF select)
 *
 *    - pricing: Precios
 *      • Campos: title (nombre), price (ACF text), content (descripción)
 *
 * 3. CREAR ACF OPTIONS PAGE para configuraciones globales:
 *    • hero_title, hero_subtitle, hero_description
 *    • contact_email, contact_phone, contact_whatsapp, etc.
 *
 * 4. HABILITAR REST API para los CPTs:
 *    Al registrar el CPT, asegurarse de: 'show_in_rest' => true
 *
 * 5. CONFIGURAR CORS (si Astro está en dominio diferente):
 *    Añadir headers en WordPress:
 *    add_action('rest_api_init', function() {
 *      header('Access-Control-Allow-Origin: https://tu-sitio-astro.com');
 *    });
 *
 * 6. USAR LOS SERVICIOS DE wordpress.ts:
 *    import { getHeroSlides, getTestimonials } from '../lib/wordpress';
 *    const slides = await getHeroSlides();
 *
 * 7. INVALIDACIÓN DE CACHÉ:
 *    - En build time: Astro regenera todo
 *    - Para SSR: El caché en memoria se invalida cada hora
 *    - Opcional: Webhook de WordPress -> Astro para rebuild on publish
 */

// ============================================
// TIPOS DE DATOS
// ============================================

export interface SiteSettings {
	title: string;
	description: string;
	logo?: string;
}

export interface HeroSlide {
	title: string;
	subtitle?: string;
	image: string;
	alt: string;
}

export interface HeroData {
	title: string;
	subtitle: string;
	description: string;
	ctaPrimary: string;
	ctaSecondary: string;
	slides: HeroSlide[];
}

export interface Experience {
	id: number;
	title: string;
	description: string;
	image: string;
	icon: "mountain" | "waves" | "wind" | "utensils";
}

export interface PhilosophyItem {
	icon: "heart" | "users" | "leaf" | "clock";
	title: string;
	description: string;
}

export interface PhilosophyData {
	subtitle: string;
	title: string;
	description: string;
	items: PhilosophyItem[];
}

export interface PricingExperience {
	id: number;
	name: string;
	price: string;
	description: string;
}

export interface PricingDetail {
	icon: "calendar" | "users" | "credit-card";
	title: string;
	description: string;
}

export interface PricingData {
	subtitle: string;
	title: string;
	description: string;
	experiences: PricingExperience[];
	details: PricingDetail[];
}

export interface ContactData {
	subtitle: string;
	title: string;
	description: string;
	email: string;
	phone: string;
	whatsapp: string;
	instagram: string;
	instagramUrl: string;
	location: string;
}

export interface FooterData {
	description: string;
	email: string;
	instagram: string;
	instagramUrl: string;
	copyright: string;
}

export interface Testimonial {
	id: number;
	name: string;
	location?: string;
	experience: string;
	text: string;
	rating: number;
	date?: string;
	avatar?: string;
}

export interface TestimonialsData {
	subtitle: string;
	title: string;
	description: string;
	testimonials: Testimonial[];
}

export interface NavLink {
	href: string;
	label: string;
}

// ============================================
// DATOS MOCKEADOS
// ============================================

export const siteSettings: SiteSettings = {
	title: "Walden Adventures GC",
	description: "Experiencias al aire libre en Gran Canaria para disfrutar con calma",
};

export const navLinks: NavLink[] = [
	{ href: "#experiences", label: "Experiencias" },
	{ href: "#philosophy", label: "Filosofía" },
	{ href: "#pricing", label: "Precios" },
	{ href: "#testimonials", label: "Opiniones" },
	{ href: "#contact", label: "Contacto" },
];

export const heroData: HeroData = {
	title: "Experiencias al aire libre en Gran Canaria para disfrutar con calma",
	subtitle: "Gran Canaria, España",
	description: "Creamos experiencias al aire libre pensadas para quienes quieren desconectar del ritmo diario, disfrutar de la naturaleza y compartir buenos momentos en un entorno cuidado y tranquilo.",
	ctaPrimary: "Descubre nuestras experiencias",
	ctaSecondary: "Contactar",
	slides: [
		{ title: "Kayak en la costa", subtitle: "Explora el mar", image: "/images/01.jpg", alt: "Kayak en la costa de Gran Canaria" },
		{ title: "Caminatas por los pinares", subtitle: "Conecta con la naturaleza", image: "/images/02.jpg", alt: "Caminata por los pinares" },
		{ title: "Paddle surf al atardecer", subtitle: "Equilibrio y paz", image: "/images/03.jpg", alt: "Paddle surf al atardecer" },
		{ title: "Comida al aire libre", subtitle: "Sabores auténticos", image: "/images/04.jpg", alt: "Comida al aire libre" },
		{ title: "Aventura en grupo", subtitle: "Momentos compartidos", image: "/images/05.jpg", alt: "Aventura en la naturaleza" },
	],
};

export const experiencesData: Experience[] = [
	{
		id: 1,
		title: "Caminatas",
		description: "Caminatas por entornos naturales de Gran Canaria a un ritmo cómodo y accesible.",
		image: "/images/01.jpg",
		icon: "mountain",
	},
	{
		id: 2,
		title: "Kayak",
		description: "Kayak en zonas tranquilas de la costa, disfrutando del mar desde una perspectiva única.",
		image: "/images/02.jpg",
		icon: "waves",
	},
	{
		id: 3,
		title: "Paddle Surf",
		description: "Paddle surf apto para todos los niveles. Una experiencia relajante y divertida.",
		image: "/images/03.jpg",
		icon: "wind",
	},
	{
		id: 4,
		title: "Comida al aire libre",
		description: "Paella o asadero en plena naturaleza. Compartir mesa forma parte esencial de la experiencia.",
		image: "/images/04.jpg",
		icon: "utensils",
	},
];

export const philosophyData: PhilosophyData = {
	subtitle: "Cómo son nuestras actividades",
	title: "El objetivo no es hacer más, sino disfrutar mejor",
	description: "Trabajamos siempre con grupos reducidos, ritmo accesible y atención al detalle, para que cada salida sea una experiencia cercana, auténtica y sin prisas.",
	items: [
		{
			icon: "users",
			title: "Grupos pequeños",
			description: "Máximo 8 personas por experiencia",
		},
		{
			icon: "clock",
			title: "Ritmo cómodo",
			description: "Sin prisas, accesible para todos",
		},
		{
			icon: "heart",
			title: "Sin experiencia previa",
			description: "No se requiere experiencia previa",
		},
		{
			icon: "leaf",
			title: "Ambiente cercano",
			description: "Relajado y respetuoso con el entorno",
		},
	],
};

export const pricingData: PricingData = {
	subtitle: "Precios por persona",
	title: "Elige tu experiencia",
	description: "Todas las experiencias incluyen la comida, porque creemos que compartir mesa forma parte esencial de la experiencia.",
	experiences: [
		{
			id: 1,
			name: "Caminata + comida",
			price: "30",
			description: "Rutas por volcanes y pinares con paella o asadero incluido",
		},
		{
			id: 2,
			name: "Kayak + comida",
			price: "47,50",
			description: "Travesía costera en kayak con comida al aire libre",
		},
		{
			id: 3,
			name: "Paddle surf + comida",
			price: "47,50",
			description: "Navegación sobre el agua para todos los niveles con comida",
		},
		{
			id: 4,
			name: "Caminata + kayak + comida",
			price: "55",
			description: "Jornada completa combinando tierra y mar",
		},
		{
			id: 5,
			name: "Caminata + paddle surf + comida",
			price: "55",
			description: "Aventura doble con senderismo y paddle surf",
		},
	],
	details: [
		{
			icon: "calendar",
			title: "Sábados y domingos",
			description: "Actividades los fines de semana",
		},
		{
			icon: "users",
			title: "Mínimo 4, máximo 8",
			description: "Grupos reducidos garantizados",
		},
		{
			icon: "credit-card",
			title: "Reserva con 10 €",
			description: "Resto el día de la actividad",
		},
	],
};

export const contactData: ContactData = {
	subtitle: "Contacto",
	title: "¿Listo para tu próxima aventura?",
	description: "Escríbenos y cuéntanos qué experiencia te gustaría vivir. Te responderemos lo antes posible para organizar tu escapada.",
	email: "hola@waldenadventures.com",
	phone: "+34 600 000 000",
	whatsapp: "34600000000",
	instagram: "@waldenadventuresgc",
	instagramUrl: "https://instagram.com/waldenadventuresgc",
	location: "Gran Canaria, España",
};

export const testimonialsData: TestimonialsData = {
	subtitle: "Testimonios",
	title: "Lo que dicen nuestros aventureros",
	description: "Experiencias reales de quienes han disfrutado de nuestras actividades al aire libre.",
	testimonials: [
		{
			id: 1,
			name: "María García",
			location: "Las Palmas",
			experience: "Kayak + comida",
			text: "Una experiencia increíble. El ritmo fue perfecto, sin prisas, disfrutando cada momento. La paella al final fue el broche de oro. Volveré seguro.",
			rating: 5,
			date: "Noviembre 2024",
		},
		{
			id: 2,
			name: "Carlos Rodríguez",
			location: "Telde",
			experience: "Caminata + kayak + comida",
			text: "Buscaba desconectar y lo conseguí. El grupo pequeño hace que todo sea más cercano y auténtico. Los guías súper atentos.",
			rating: 5,
			date: "Octubre 2024",
		},
		{
			id: 3,
			name: "Ana Martínez",
			location: "Madrid",
			experience: "Paddle surf + comida",
			text: "Vine de vacaciones y fue el mejor plan. Nunca había hecho paddle surf y me sentí muy cómoda. El asadero en plena naturaleza, espectacular.",
			rating: 5,
			date: "Septiembre 2024",
		},
	],
};

export const footerData: FooterData = {
	description: "Experiencias al aire libre en Gran Canaria para disfrutar con calma.",
	email: "hola@waldenadventures.com",
	instagram: "@waldenadventuresgc",
	instagramUrl: "https://instagram.com/waldenadventuresgc",
	copyright: `© ${new Date().getFullYear()} Walden Adventures GC. Todos los derechos reservados.`,
};

// ============================================
// FUNCIÓN PARA OBTENER TODOS LOS DATOS
// ============================================

export interface AllPageData {
	site: SiteSettings;
	nav: NavLink[];
	hero: HeroData;
	experiences: Experience[];
	philosophy: PhilosophyData;
	pricing: PricingData;
	testimonials: TestimonialsData;
	contact: ContactData;
	footer: FooterData;
}

/**
 * Obtiene todos los datos de la página
 *
 * Actualmente usa datos mockeados. Para conectar con WordPress:
 * 1. Configura SITE_URL en src/consts.ts apuntando a tu WordPress
 * 2. Crea los CPTs necesarios en WordPress (ver guía arriba)
 * 3. Descomenta las líneas de importación y llamadas a WordPress
 *
 * @example
 * // Cuando WordPress esté configurado:
 * import {
 *   getHeroSlides,
 *   getTestimonials,
 *   getExperiences,
 *   getPricing,
 *   getSiteSettings,
 *   stripHtml,
 *   getFeaturedImage
 * } from './wordpress';
 *
 * export async function getPageData(): Promise<AllPageData> {
 *   const [wpSlides, wpTestimonials, wpSettings] = await Promise.all([
 *     getHeroSlides(),
 *     getTestimonials(),
 *     getSiteSettings()
 *   ]);
 *
 *   // Mapear datos de WordPress a la estructura de la app
 *   const slides = wpSlides.map(s => ({
 *     title: stripHtml(s.title.rendered),
 *     subtitle: s.meta.slide_subtitle,
 *     image: getFeaturedImage(s)?.url || '/images/01.jpg',
 *     alt: stripHtml(s.title.rendered)
 *   }));
 *
 *   // ... resto del mapeo
 * }
 */
export async function getPageData(): Promise<AllPageData> {
	// Usar datos mockeados mientras WordPress no está configurado
	return {
		site: siteSettings,
		nav: navLinks,
		hero: heroData,
		experiences: experiencesData,
		philosophy: philosophyData,
		pricing: pricingData,
		testimonials: testimonialsData,
		contact: contactData,
		footer: footerData,
	};
}
