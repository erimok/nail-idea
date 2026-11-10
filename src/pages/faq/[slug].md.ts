import { siteServices } from '../../composition';
import { renderFaqMarkdown } from '../../adapters/presentation/ai/markdown';

export async function getStaticPaths() {
	return (await siteServices.listFaqRoutes()).map(({ slug }) => ({ params: { slug } }));
}

export async function GET({ params }: { params: { slug: string } }): Promise<Response> {
	const viewModel = await siteServices.buildFaqPage(params.slug);
	return new Response(renderFaqMarkdown(viewModel), {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
}
