import { siteServices } from '../composition';
import { renderLlmsTxt } from '../adapters/presentation/ai/markdown';

export async function GET(): Promise<Response> {
	const viewModel = await siteServices.buildLlmsIndex();
	return new Response(renderLlmsTxt(viewModel), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
