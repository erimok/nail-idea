import type { NailArea } from '../../domain/areas';
import { siteServices } from '../../composition';
import { renderPageMarkdown } from '../../adapters/presentation/ai/markdown';

export async function getStaticPaths() {
	return (await siteServices.listHubRoutes()).indexableHubRoutes.map(({ area, slug }) => ({
		params: { area, slug },
	}));
}

export async function GET({ params }: { params: { area?: string; slug?: string } }): Promise<Response> {
	const { area, slug } = params as { area: NailArea; slug: string };
	const viewModel = await siteServices.buildHubPage({ area, slug });
	return new Response(renderPageMarkdown(viewModel), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
}
