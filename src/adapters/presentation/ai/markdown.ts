import { toMarkdown } from 'mdast-util-to-markdown';
import type { PhrasingContent, Root, RootContent } from 'mdast';
import type { CollectionPageViewModel, LlmsIndexViewModel } from '../../../application/view-models';

function text(value: string): PhrasingContent {
	return { type: 'text', value };
}

function absoluteUrl(url: string, canonical: string): string {
	return new URL(url, canonical).toString();
}

function renderIntro(viewModel: CollectionPageViewModel): RootContent[] {
	if (!viewModel.intro?.length) return [];

	const children: PhrasingContent[] = viewModel.intro.map((segment) => segment.href
		? {
			type: 'link',
			url: absoluteUrl(segment.href, viewModel.layout.canonical),
			children: [text(segment.text)],
		}
		: text(segment.text));

	return [{ type: 'paragraph', children }];
}

export function renderPageMarkdown(viewModel: CollectionPageViewModel): string {
	const areaLabel = viewModel.breadcrumbs[1]?.label;
	const children: RootContent[] = [
		{ type: 'heading', depth: 1, children: [text(viewModel.heading)] },
		{ type: 'blockquote', children: [{ type: 'paragraph', children: [text(viewModel.layout.description)] }] },
		...renderIntro(viewModel),
		...(areaLabel ? [{ type: 'paragraph', children: [text(`Area: ${areaLabel}.`)] } satisfies RootContent] : []),
		{ type: 'heading', depth: 2, children: [text(viewModel.sectionTitle)] },
		{
			type: 'list',
			ordered: false,
			spread: false,
			children: viewModel.designs.map((design) => {
				const imageUrl = design.imageSrc || design.image;
				const title: PhrasingContent = { type: 'strong', children: [text(design.title)] };

				return {
					type: 'listItem',
					spread: false,
					children: [{
						type: 'paragraph',
						children: [
							imageUrl
								? { type: 'link', url: absoluteUrl(imageUrl, viewModel.layout.canonical), children: [title] }
								: title,
							...(design.description ? [text(`: ${design.description}`)] : []),
						],
					}],
				};
			}),
		},
	];

	if (viewModel.relatedLinks) {
		const links = viewModel.relatedLinks.groups.flatMap((group) => group.links);
		if (links.length > 0) {
			children.push(
				{ type: 'heading', depth: 2, children: [text(viewModel.relatedLinks.title)] },
				{
					type: 'list',
					ordered: false,
					spread: false,
					children: links.map((link) => ({
						type: 'listItem',
						spread: false,
						children: [{
							type: 'paragraph',
							children: [{
								type: 'link',
								url: absoluteUrl(link.href.replace(/\/$/, '.md'), viewModel.layout.canonical),
								children: [text(link.label)],
							}],
						}],
					})),
				},
			);
		}
	}

	children.push({
		type: 'paragraph',
		children: [
			text('View the '),
			{
				type: 'link',
				url: viewModel.layout.canonical,
				children: [text('canonical HTML page')],
			},
			text('.'),
		],
	});

	return toMarkdown({ type: 'root', children } satisfies Root).trimEnd();
}

export function renderLlmsTxt(viewModel: LlmsIndexViewModel): string {
	const children: RootContent[] = [
		{ type: 'heading', depth: 1, children: [text('nail-idea.com')] },
		{
			type: 'blockquote',
			children: [{
				type: 'paragraph',
				children: [text('Find manicure and pedicure ideas, with designs organized by style and attributes.')],
			}],
		},
	];

	for (const { area, pages } of viewModel.areas) {
		if (pages.length === 0) continue;

		const areaLabel = `${area[0].toUpperCase()}${area.slice(1)}`;
		children.push(
			{ type: 'heading', depth: 2, children: [text(areaLabel)] },
			{
				type: 'list',
				ordered: false,
				spread: false,
				children: pages.map((page) => ({
					type: 'listItem',
					spread: false,
					children: [{
						type: 'paragraph',
						children: [
							{
								type: 'link',
								url: page.markdownUrl,
								children: [text(page.title)],
							},
							text(`: ${page.description}`),
						],
					}],
				})),
			},
		);
	}

	return toMarkdown({ type: 'root', children } satisfies Root).trimEnd();
}
