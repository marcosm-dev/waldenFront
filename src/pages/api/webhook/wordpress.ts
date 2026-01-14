// No prerender - este endpoint se ejecuta en servidor (SSR)
export const prerender = false;

/**
 * Webhook endpoint para WordPress
 *
 * Este endpoint recibe notificaciones de WordPress cuando se actualiza contenido
 * y puede disparar un rebuild del sitio o invalidar caché.
 *
 * Para usar este webhook:
 * 1. Instala el plugin "WP Webhooks" o similar en WordPress
 * 2. Configura un webhook que apunte a: https://tu-sitio.com/api/webhook/wordpress
 * 3. Configura el secreto en las variables de entorno: WORDPRESS_WEBHOOK_SECRET
 *
 * Para deployment en Vercel/Netlify:
 * - Vercel: Usa Deploy Hooks para disparar un rebuild
 * - Netlify: Usa Build Hooks para disparar un rebuild
 */

import type { APIRoute } from 'astro';
import { clearCache } from '../../../lib/wordpress';

// Tipos para el payload de WordPress
interface WordPressWebhookPayload {
	action: 'create' | 'update' | 'delete' | 'trash' | 'publish';
	post_type?: 'post' | 'page' | 'attachment';
	post_id?: number;
	post_slug?: string;
	post_status?: string;
}

// Verifica la firma del webhook (si se usa autenticación)
function verifyWebhookSignature(
	payload: string,
	signature: string | null,
	secret: string
): boolean {
	if (!secret || !signature) return true; // Sin secreto, acepta todo (no recomendado en producción)

	// Implementación básica - en producción usar crypto.timingSafeEqual
	const crypto = globalThis.crypto;
	const encoder = new TextEncoder();

	// Para una implementación más segura, usa HMAC-SHA256
	// Por simplicidad, aquí hacemos una comparación básica
	const expectedSignature = `sha256=${secret}`;
	return signature === expectedSignature;
}

export const POST: APIRoute = async ({ request }) => {
	try {
		// Obtener el secreto de las variables de entorno
		const webhookSecret = import.meta.env.WORDPRESS_WEBHOOK_SECRET || '';

		// Verificar firma si está configurada
		const signature = request.headers.get('x-webhook-signature') ||
						  request.headers.get('x-wp-webhook-signature');

		const body = await request.text();

		if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
			return new Response(JSON.stringify({ error: 'Invalid signature' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Parsear el payload
		let payload: WordPressWebhookPayload;
		try {
			payload = JSON.parse(body);
		} catch {
			return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		console.log('[WordPress Webhook] Received:', payload);

		// Limpiar caché según el tipo de contenido actualizado
		if (payload.post_type === 'post') {
			clearCache('/posts');
			if (payload.post_slug) {
				clearCache(payload.post_slug);
			}
		} else if (payload.post_type === 'page') {
			clearCache('/pages');
			if (payload.post_slug) {
				clearCache(payload.post_slug);
			}
		} else if (payload.post_type === 'attachment') {
			clearCache('/media');
		} else {
			// Limpiar toda la caché si no se especifica el tipo
			clearCache();
		}

		// Opcionalmente, disparar un rebuild en plataformas de hosting
		// Esto requiere configuración adicional según la plataforma
		await triggerRebuildIfConfigured();

		return new Response(JSON.stringify({
			success: true,
			message: 'Cache cleared successfully',
			payload: {
				action: payload.action,
				post_type: payload.post_type,
				post_id: payload.post_id,
			}
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});

	} catch (error) {
		console.error('[WordPress Webhook] Error:', error);
		return new Response(JSON.stringify({
			error: 'Internal server error',
			message: error instanceof Error ? error.message : 'Unknown error'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};

// También soportar GET para verificar que el endpoint funciona
export const GET: APIRoute = async () => {
	return new Response(JSON.stringify({
		status: 'ok',
		message: 'WordPress webhook endpoint is active',
		usage: 'Send POST request with WordPress webhook payload'
	}), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};

// Función para disparar rebuild en plataformas de hosting
async function triggerRebuildIfConfigured(): Promise<void> {
	// Vercel Deploy Hook
	const vercelHook = import.meta.env.VERCEL_DEPLOY_HOOK;
	if (vercelHook) {
		try {
			await fetch(vercelHook, { method: 'POST' });
			console.log('[WordPress Webhook] Triggered Vercel rebuild');
		} catch (error) {
			console.error('[WordPress Webhook] Failed to trigger Vercel rebuild:', error);
		}
	}

	// Netlify Build Hook
	const netlifyHook = import.meta.env.NETLIFY_BUILD_HOOK;
	if (netlifyHook) {
		try {
			await fetch(netlifyHook, { method: 'POST' });
			console.log('[WordPress Webhook] Triggered Netlify rebuild');
		} catch (error) {
			console.error('[WordPress Webhook] Failed to trigger Netlify rebuild:', error);
		}
	}

	// Cloudflare Pages Deploy Hook
	const cloudflareHook = import.meta.env.CLOUDFLARE_DEPLOY_HOOK;
	if (cloudflareHook) {
		try {
			await fetch(cloudflareHook, { method: 'POST' });
			console.log('[WordPress Webhook] Triggered Cloudflare Pages rebuild');
		} catch (error) {
			console.error('[WordPress Webhook] Failed to trigger Cloudflare rebuild:', error);
		}
	}
}
