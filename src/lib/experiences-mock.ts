/**
 * Mock temporal para los campos extendidos de una Experience que
 * todavía NO existen en Strapi. Cuando añadas estos campos en
 * el content-type de Strapi (tagline, longDescription, highlights,
 * includes, price, duration, difficulty, groupSize), puedes borrar
 * este archivo y `fillExperienceWithMock` devolverá directamente
 * los valores reales.
 *
 * El mock por slug se mergea con los datos reales: cualquier
 * campo presente en Strapi gana sobre el mock.
 */

import type { StrapiExperience } from './data';

export interface ExperienceMockFields {
	tagline: string;
	longDescription: string;
	price: string;
	duration: string;
	difficulty: string;
	groupSize: string;
	highlights: Array<{ text: string }>;
	includes: Array<{ text: string }>;
}

/**
 * Mocks específicos por slug. Ajusta las claves a los slugs
 * reales que uses en Strapi. Si un slug no está aquí se usa
 * el mock genérico de `DEFAULT_MOCK`.
 */
const MOCKS_BY_SLUG: Record<string, Partial<ExperienceMockFields>> = {
	senderismo: {
		tagline: 'Rutas guiadas por Gran Canaria',
		longDescription:
			'Recorre los senderos más espectaculares de la isla acompañado por guías locales expertos. Descubre paisajes únicos, flora endémica y miradores escondidos mientras conectas con la naturaleza a tu propio ritmo.',
		price: '45€',
		duration: '4-6 horas',
		difficulty: 'Moderada',
		groupSize: '2-8 personas',
		highlights: [
			{ text: 'Rutas exclusivas fuera de los caminos turísticos' },
			{ text: 'Guía local con formación en botánica y geología' },
			{ text: 'Paradas fotográficas en los mejores miradores' },
			{ text: 'Historia y leyendas de cada lugar' },
		],
		includes: [
			{ text: 'Guía profesional' },
			{ text: 'Picnic de producto local' },
			{ text: 'Seguro de actividad' },
			{ text: 'Transporte al punto de inicio' },
			{ text: 'Bastones de trekking' },
			{ text: 'Agua y snacks' },
		],
	},
	kayak: {
		tagline: 'Aventura en el océano Atlántico',
		longDescription:
			'Navega por las calas más recónditas de la costa grancanaria en kayak. Una experiencia íntima con el mar donde podrás ver delfines, tortugas y acantilados imposibles de alcanzar por tierra.',
		price: '55€',
		duration: '3 horas',
		difficulty: 'Fácil',
		groupSize: '2-6 personas',
		highlights: [
			{ text: 'Travesía por calas vírgenes solo accesibles por mar' },
			{ text: 'Avistamiento de fauna marina (delfines, tortugas)' },
			{ text: 'Snorkel en aguas cristalinas' },
			{ text: 'Briefing de seguridad y técnica' },
		],
		includes: [
			{ text: 'Kayak y pala' },
			{ text: 'Chaleco salvavidas' },
			{ text: 'Gafas y tubo de snorkel' },
			{ text: 'Guía acuático titulado' },
			{ text: 'Fotografías de la experiencia' },
			{ text: 'Bebida y fruta al final' },
		],
	},
	yoga: {
		tagline: 'Conexión mente-cuerpo-naturaleza',
		longDescription:
			'Sesiones de yoga al amanecer o atardecer en enclaves naturales únicos. Una práctica consciente pensada para desconectar del ritmo urbano y encontrar calma en los paisajes volcánicos y costeros de la isla.',
		price: '35€',
		duration: '90 minutos',
		difficulty: 'Todos los niveles',
		groupSize: '4-10 personas',
		highlights: [
			{ text: 'Práctica en playas, dunas o miradores' },
			{ text: 'Instructora certificada con +10 años de experiencia' },
			{ text: 'Meditación guiada incluida' },
			{ text: 'Sesión adaptada al nivel del grupo' },
		],
		includes: [
			{ text: 'Esterilla y props' },
			{ text: 'Instructora certificada' },
			{ text: 'Té e infusión al finalizar' },
			{ text: 'Fotografía del grupo' },
		],
	},
	'e-bike': {
		tagline: 'Explora la isla sin esfuerzo',
		longDescription:
			'Rutas en bicicleta eléctrica por pueblos, barrancos y costa. Cubre más terreno, disfruta de las subidas y descubre rincones auténticos de Gran Canaria con una asistencia eléctrica que hace la experiencia accesible para todos.',
		price: '65€',
		duration: '4 horas',
		difficulty: 'Fácil',
		groupSize: '2-6 personas',
		highlights: [
			{ text: 'E-bikes de gama alta con autonomía garantizada' },
			{ text: 'Paradas en productores locales (queso, vino, miel)' },
			{ text: 'Ruta personalizada según condición física' },
			{ text: 'Casco y guía por radio' },
		],
		includes: [
			{ text: 'E-bike de gama alta' },
			{ text: 'Casco y guantes' },
			{ text: 'Seguro de actividad' },
			{ text: 'Degustación de producto local' },
			{ text: 'Agua y barrita energética' },
			{ text: 'Guía especializado' },
		],
	},
};

/**
 * Mock genérico que se aplica a cualquier experiencia que no
 * tenga una entrada específica en MOCKS_BY_SLUG. Pensado para
 * que cualquier slug nuevo siga mostrando la página completa.
 */
const DEFAULT_MOCK: ExperienceMockFields = {
	tagline: 'Experiencia Walden en la naturaleza',
	longDescription:
		'Una experiencia cuidadosamente diseñada para conectarte con el paisaje, la cultura y el ritmo auténtico de Gran Canaria. Pequeños grupos, guías locales y enfoque en la experiencia, no en la masificación.',
	price: '50€',
	duration: '3-4 horas',
	difficulty: 'Moderada',
	groupSize: '2-8 personas',
	highlights: [
		{ text: 'Grupos reducidos para una experiencia personal' },
		{ text: 'Guía local con conocimiento profundo de la zona' },
		{ text: 'Enclaves únicos lejos del circuito turístico' },
		{ text: 'Ritmo pausado para disfrutar cada momento' },
	],
	includes: [
		{ text: 'Guía profesional' },
		{ text: 'Equipamiento necesario' },
		{ text: 'Seguro de actividad' },
		{ text: 'Snack y bebida' },
	],
};

/**
 * Mergea un StrapiExperience con su mock: los campos reales
 * de Strapi (cuando existan y no estén vacíos) tienen prioridad.
 * Devuelve siempre todos los campos rellenos, por lo que la
 * página de detalle nunca se queda en blanco.
 */
export function fillExperienceWithMock(
	experience: StrapiExperience,
): StrapiExperience & ExperienceMockFields {
	const mock = { ...DEFAULT_MOCK, ...(MOCKS_BY_SLUG[experience.slug] ?? {}) };

	const hasValue = <T>(value: T | null | undefined): value is T =>
		value !== null && value !== undefined && value !== '';

	return {
		...experience,
		tagline: hasValue(experience.tagline) ? experience.tagline! : mock.tagline,
		longDescription: hasValue(experience.longDescription)
			? experience.longDescription!
			: mock.longDescription,
		price: hasValue(experience.price) ? experience.price! : mock.price,
		duration: hasValue(experience.duration) ? experience.duration! : mock.duration,
		difficulty: hasValue(experience.difficulty)
			? experience.difficulty!
			: mock.difficulty,
		groupSize: hasValue(experience.groupSize)
			? experience.groupSize!
			: mock.groupSize,
		highlights:
			experience.highlights && experience.highlights.length > 0
				? experience.highlights
				: mock.highlights,
		includes:
			experience.includes && experience.includes.length > 0
				? experience.includes
				: mock.includes,
	};
}
