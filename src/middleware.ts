import { defineMiddleware } from 'astro:middleware';

const ENABLED = import.meta.env.BASIC_AUTH_ENABLED === 'true';
const USER = import.meta.env.BASIC_AUTH_USER ?? 'admin';
const PASS = import.meta.env.BASIC_AUTH_PASS ?? 'password';

export const onRequest = defineMiddleware((context, next) => {
	if (!ENABLED) return next();

	const authorization = context.request.headers.get('Authorization');

	if (authorization) {
		const [scheme, encoded] = authorization.split(' ');
		if (scheme === 'Basic' && encoded) {
			const decoded = atob(encoded);
			const colonIndex = decoded.indexOf(':');
			if (colonIndex !== -1) {
				const user = decoded.slice(0, colonIndex);
				const pass = decoded.slice(colonIndex + 1);
				if (user === USER && pass === PASS) {
					return next();
				}
			}
		}
	}

	return new Response('Unauthorized', {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="Walden Adventures", charset="UTF-8"',
		},
	});
});
