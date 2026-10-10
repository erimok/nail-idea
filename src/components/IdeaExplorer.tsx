import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import type { IAIResponse } from '../libs/ai/types';
import { searchNails, type NailSearchRecord } from '../libs/ai/nail-search';
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
	initialPrompt = '',
	compact = false,
	collage = [],
}: {
	nails?: readonly NailSearchRecord[];
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
			<section className={`enter-view grid gap-x-14 gap-y-5 ${compact ? 'grid-cols-1' : 'lg:grid-cols-2 lg:gap-y-6'}`} aria-labelledby={compact ? undefined : 'page-title'}>
				{!compact && <p className="order-1 mb-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-coral lg:col-span-2">
						<span className="h-px w-8 bg-coral" aria-hidden="true" />
						Your next set starts here
					</p>}
				{!compact && <h1 id="page-title" className="order-2 max-w-4xl self-start font-display text-4xl leading-tight text-ink sm:text-5xl lg:row-start-2 lg:self-center lg:text-6xl">
						Manicure Ideas
						<span className="mt-2 block text-olive">Made personal.</span>
					</h1>}
				{!compact && <p className="order-3 mt-0 max-w-[42rem] self-end text-base leading-7 text-muted sm:text-lg lg:row-start-3">
						Describe the manicure on your mind. We’ll pick out the colors, shape, finish, and details.
					</p>}
				{collage.length > 0 && !compact && (
					<div className="order-6 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-2" role="group" aria-label="Featured nail designs">
						{collage.map((image) => (
							<picture key={image.slug} className="block w-[72vw] shrink-0 snap-start overflow-hidden rounded-lg sm:w-auto">
								<source type="image/avif" srcSet={image.avifSrcSet} />
								<source type="image/webp" srcSet={image.webpSrcSet} />
								<img alt={image.alt} className="aspect-[4/3] w-full object-cover" decoding="async" fetchPriority={image.priority ? 'high' : 'auto'} height="360" loading={image.priority ? 'eager' : 'lazy'} src={image.fallback} width="480" />
							</picture>
						))}
					</div>
				)}

					<form className="order-4 mt-0 w-full lg:col-span-2" onSubmit={handleSubmit}>
						<label htmlFor="idea-prompt" className="mb-3 block text-sm font-bold text-ink">
							What are you imagining?
						</label>
						<div className="rounded-lg border border-line bg-white p-5 shadow-[0_12px_35px_-30px_rgba(23,43,36,0.45)] transition-shadow focus-within:border-olive focus-within:shadow-[0_12px_35px_-24px_rgba(90,114,52,0.35)]">
							<textarea
								id="idea-prompt"
								aria-describedby="prompt-hint prompt-count"
								aria-label="Describe your nail idea"
								className="min-h-28 w-full resize-y border-0 bg-transparent text-base leading-7 text-ink outline-none placeholder:text-muted focus:ring-0"
								maxLength={400}
								placeholder="Try: short almond nails, glossy red French tips for a spring wedding…"
								value={prompt}
								onChange={(event) => {
									setPrompt(event.target.value);
									setError('');
									setResult(null);
								}}
							/>
							<div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
								<div className="flex min-w-0 flex-1 items-center justify-between gap-4">
									<span id="prompt-hint" className="text-xs leading-5 text-muted">Color, shape, mood, occasion — any detail helps.</span>
									<span id="prompt-count" className="shrink-0 text-xs tabular-nums text-muted">{prompt.length}/400</span>
								</div>
								<button
									className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-ink px-5 text-sm font-bold text-white transition hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-olive disabled:cursor-not-allowed disabled:bg-line disabled:text-muted sm:w-auto"
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

						{!compact && <div className="order-5 mt-0 flex flex-wrap items-center gap-x-4 gap-y-3 lg:col-span-2">
						<p className="mb-1 w-full text-xs font-bold uppercase text-muted sm:mb-0 sm:w-auto">Need a first thought?</p>
						<div className="flex flex-wrap gap-2">
							{examples.map((example) => (
								<button
									key={example.label}
									className="min-h-11 cursor-pointer rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink-soft transition hover:border-olive hover:bg-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
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
			</section>

				{result && (
					<section ref={resultsRef} className="enter-view mx-auto mt-10 w-full scroll-mt-6" aria-label="Matching nail ideas" aria-live="polite">
						<div className="flex items-end justify-between gap-4 border-b border-line pb-4">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-olive">From the Nails collection</p>
								<h2 className="mt-1 font-display text-3xl">Closest matches</h2>
							</div>
							<span className="text-xs font-semibold text-muted">{matchCountLabel}</span>
						</div>
						{matches.length === 0 ? (
							<p className="mt-4 text-sm leading-6 text-muted">No close matches yet. Try another color, style, or nail shape.</p>
						) : (
							<NailGrid items={visibleMatches} />
						)}
					</section>
					)}
			</>
	);
}