import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
	// Validar el secret para autorizar la petición desde Strapi
	const secret = request.headers.get('x-webhook-secret');

	if (!secret || secret !== import.meta.env.REVALIDATE_SECRET) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const githubRepo = import.meta.env.GITHUB_REPO; // formato: "owner/repo"
	const githubToken = import.meta.env.GITHUB_TOKEN;

	if (!githubRepo || !githubToken) {
		return new Response(JSON.stringify({ error: 'GitHub config missing' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// Disparar el workflow de GitHub Actions via repository_dispatch
	const githubResponse = await fetch(
		`https://api.github.com/repos/${githubRepo}/dispatches`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${githubToken}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ event_type: 'cms-update' }),
		}
	);

	if (!githubResponse.ok) {
		const error = await githubResponse.text();
		console.error('[Revalidate] GitHub API error:', error);
		return new Response(JSON.stringify({ error: 'Failed to trigger build' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ message: 'Build triggered successfully' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
