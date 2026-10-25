import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import type { IAIResponse } from '../libs/ai/types';
import { searchNails, type NailSearchRecord } from '../libs/ai/nail-search';
import { findHubForSearch } from '../libs/ai/search-facets';
import type { SearchHubLink } from '../domain/search-hub-match';
import aiService from '../libs/ai/local';
import NailGrid from './NailGrid';

const examples = [
	{
		label: 'Short burgundy',
		prompt: 'Short burgundy almond nails with a micro French manicure.',
	},
	{
		label: 'Nude micro French',
		prompt: 'Short nude almond nails with a micro French manicure.',
	},
	{
		label: 'Long almond',
		prompt: 'Long almond manicure with a French tip.',
	},
];

interface HeroImage {
	slug: string;
	alt: string;
	avifSrcSet: string;
	webpSrcSet: string;
	fallback: string;
	priority: boolean;
}

export default function IdeaExplorer({
	nails = [],
	hubLinks = [],
	initialPrompt = '',
	compact = false,
	collage = [],
}: {
	nails?: readonly NailSearchRecord[];
	hubLinks?: readonly SearchHubLink[];
	initialPrompt?: string;
	compact?: boolean;
	collage?: readonly HeroImage[];
}) {
	const [prompt, setPrompt] = useState(initialPrompt);
	const [result, setResult] = useState<IAIResponse | null>(null);
	const [error, setError] = useState('');
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const resultsRef = useRef<HTMLElement>(null);
	const matches = result ? searchNails(result, nails) : [];
	const hub = result ? findHubForSearch(result, hubLinks) : undefined;
	const visibleMatches = matches.slice(0, 3);
	const matchCountLabel = matches.length > visibleMatches.length
		? `Showing ${visibleMatches.length} of ${matches.length} matches`
		: `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}`;

	useEffect(() => {
		if (result) {
			resultsRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
		}
	}, [result]);

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!prompt.trim()) return;

		setIsAnalyzing(true);
		setError('');
		setResult(null);
		try {
			setResult(await aiService.parsePrompt(prompt.trim()));
		} catch {
			setError('We could not read that idea. Try describing the look in a few words.');
		} finally {
			setIsAnalyzing(false);
		}
	}

	return (
		<>
			<section className={`enter-view grid gap-10 ${compact ? 'grid-cols-1' : 'lg:grid-cols-2 lg:items-center lg:gap-16'}`} aria-labelledby={compact ? undefined : 'page-title'}>
				<div className="flex flex-col gap-6">
				{!compact && <p className="eyebrow mb-0">Your next set starts here</p>}
				{!compact && <h1 id="page-title" className="font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
						Manicure Ideas
						<span className="mt-2 block font-semibold italic text-olive">Made personal.</span>
					</h1>}
				{!compact && <p className="max-w-[36rem] text-lg leading-8 text-ink-soft">
						Describe the manicure on your mind. We’ll pick out the colors, shape, finish, and details.
					</p>}

					<form className="mt-2 w-full" onSubmit={handleSubmit}>
						<label htmlFor="idea-prompt" className="eyebrow mb-4 block !text-ink">
							What are you imagining?
						</label>
						<div className="rounded-card border border-line bg-white p-6 shadow-soft transition-shadow focus-within:border-olive focus-within:shadow-glow">
							<textarea
								id="idea-prompt"
								aria-describedby="prompt-hint prompt-count"
								aria-label="Describe your nail idea"
								className="min-h-28 w-full resize-y border-0 bg-transparent font-display text-xl font-medium leading-8 text-ink outline-none sm:text-2xl placeholder:text-muted focus:ring-0"
								maxLength={400}
								placeholder="Try: short almond nails, glossy red French tips for a spring wedding…"
								value={prompt}
								onChange={(event) => {
									setPrompt(event.target.value);
									setError('');
									setResult(null);
								}}
							/>
							<div className="mt-4 flex flex-wrap items-center justify-between gap-4">
								<div className="flex min-w-0 flex-1 items-center justify-between gap-4">
									<span id="prompt-hint" className="text-xs leading-5 text-muted">Color, shape, mood, occasion — any detail helps.</span>
									<span id="prompt-count" className="shrink-0 text-xs tabular-nums text-muted">{prompt.length}/400</span>
								</div>
								<button
									className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-control bg-ink px-7 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-forest hover:shadow-lift active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-olive disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto"
									disabled={!prompt.trim() || isAnalyzing}
									type="submit"
								>
									{isAnalyzing ? 'Reading your idea…' : 'Find my designs'}
									<span aria-hidden="true">→</span>
								</button>
							</div>
						</div>
						{error && <p className="mt-3 text-sm text-coral" role="alert">{error}</p>}
					</form>

						{!compact && <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
						<p className="eyebrow !text-muted mb-1 w-full sm:mb-0 sm:w-auto">Need a first thought?</p>
						<div className="flex flex-wrap gap-2">
							{examples.map((example) => (
								<button
									key={example.label}
									className="min-h-11 cursor-pointer rounded-control border border-line bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft shadow-soft transition hover:-translate-y-0.5 hover:border-olive hover:bg-tint active:bg-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
									type="button"
									onClick={() => {
										setPrompt(example.prompt);
										setError('');
										setResult(null);
									}}
								>
									{example.label}
								</button>
							))}
						</div>
					</div>}
				</div>
				{collage.length > 0 && !compact && (
					<div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0" role="group" aria-label="Featured nail designs">
						{collage.map((image) => (
							<picture key={image.slug} className="block w-[72vw] shrink-0 snap-start overflow-hidden rounded-card shadow-soft sm:w-auto">
								<source type="image/avif" srcSet={image.avifSrcSet} />
								<source type="image/webp" srcSet={image.webpSrcSet} />
								<img alt={image.alt} className="aspect-square w-full object-cover" decoding="async" fetchPriority={image.priority ? 'high' : 'auto'} height="360" loading={image.priority ? 'eager' : 'lazy'} src={image.fallback} width="480" />
							</picture>
						))}
					</div>
				)}
			</section>

				{result && (
					<section ref={resultsRef} className="enter-view mx-auto mt-10 w-full scroll-mt-6" aria-label="Matching nail ideas" aria-live="polite">
						<div className="mb-8 flex items-end justify-between gap-4">
							<div>
								<p className="eyebrow !text-olive">From the Nails collection</p>
								<h2 className="mt-2 font-display text-4xl font-semibold">Closest matches</h2>
							</div>
							<span className="text-xs font-semibold text-muted">{matchCountLabel}</span>
						</div>
						{matches.length === 0 ? (
							<p className="mt-4 text-sm leading-6 text-muted">No close matches yet. Try another color, style, or nail shape.</p>
						) : (
							<>
								<NailGrid items={visibleMatches} />
								{hub && (
									<div className="mt-8 flex justify-center">
										<a
											className="inline-flex min-h-11 items-center justify-center gap-3 rounded-control border border-ink bg-white px-7 text-xs font-semibold uppercase tracking-[0.18em] text-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-olive"
											href={hub.href}
										>
											Show more {hub.label}
											<span aria-hidden="true">→</span>
										</a>
									</div>
								)}
							</>
						)}
					</section>
					)}
			</>
	);
}