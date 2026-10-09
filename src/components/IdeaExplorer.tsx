import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import type { IAIResponse } from '../libs/ai/types';
import { searchNails, type NailRecord } from '../libs/ai/nail-search';
import aiService from '../libs/ai/local';
import NailGrid from './NailGrid';

const examples = [
	{
		label: 'Spring French',
		prompt: 'Short almond nails, glossy red French manicure for a spring wedding.',
	},
	{
		label: 'Chrome pedi',
		prompt: 'Long square chrome pedicure in blue for summer.',
	},
	{
		label: 'Care for weak nails',
		prompt: 'A short round glossy pink manicure for weak and peeling nails.',
	},
];

export default function IdeaExplorer({ nails = [], initialPrompt = '' }: { nails?: readonly NailRecord[]; initialPrompt?: string }) {
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
		<div className="overflow-hidden bg-[#f5f6f0] text-[#172b24]">
			<main className="w-full pb-12 lg:pb-16">
				<div className="mx-auto block w-full max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:px-14 lg:pb-20 lg:pt-16">
				<section className="enter-view grid gap-x-14 gap-y-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]" aria-labelledby="page-title">
					<p className="mb-0 flex items-center gap-3 text-xs font-bold uppercase text-[#d6694c] lg:col-span-2">
						<span className="h-px w-8 bg-[#d6694c]" aria-hidden="true" />
						Your next set starts here
					</p>
					<h1 id="page-title" className="max-w-4xl font-display text-4xl leading-[1.04] sm:text-5xl lg:text-6xl">
						Manicure and Pedicure Ideas
						<span className="mt-2 block text-[#718b42]">Made personal.</span>
					</h1>
					<p className="mt-0 max-w-[42rem] self-end text-base leading-7 text-[#617269] sm:text-lg lg:col-start-2 lg:row-start-2 lg:pb-2">
						Describe the manicure or pedicure on your mind. We’ll pick out the colors, shape, finish, and details.
					</p>

					<form className="mt-0 w-full lg:col-span-2" onSubmit={handleSubmit}>
						<label htmlFor="idea-prompt" className="mb-3 block text-sm font-bold text-[#172b24]">
							What are you imagining?
						</label>
						<div className="rounded-lg border border-[#d9dfd4] bg-white p-3.5 shadow-[0_12px_35px_-30px_rgba(23,43,36,0.45)] transition-shadow focus-within:border-[#718b42] focus-within:shadow-[0_12px_35px_-24px_rgba(113,139,66,0.35)] sm:p-4">
							<textarea
								id="idea-prompt"
								aria-describedby="prompt-hint prompt-count"
								aria-label="Describe your nail idea"
								className="min-h-24 w-full resize-y border-0 bg-transparent text-base leading-7 text-[#172b24] outline-none placeholder:text-[#9aa69d] focus:ring-0 sm:min-h-28"
								maxLength={400}
								placeholder="Try: short almond nails, glossy red French tips for a spring wedding…"
								value={prompt}
								onChange={(event) => {
									setPrompt(event.target.value);
									setError('');
									setResult(null);
								}}
							/>
							<div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0e9] pt-3">
								<div className="flex min-w-0 flex-1 items-center justify-between gap-4">
									<span id="prompt-hint" className="text-xs leading-5 text-[#7c8980]">Color, shape, mood, occasion — any detail helps.</span>
									<span id="prompt-count" className="shrink-0 text-xs tabular-nums text-[#89968d]">{prompt.length}/400</span>
								</div>
								<button
									className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#172b24] px-5 text-sm font-bold text-white transition hover:bg-[#304a3c] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#718b42] disabled:cursor-not-allowed disabled:bg-[#dce3d8] disabled:text-[#617269] sm:w-auto"
									disabled={!prompt.trim() || isAnalyzing}
									type="submit"
								>
									{isAnalyzing ? 'Reading your idea…' : 'Analyze this idea'}
									<span aria-hidden="true">↗</span>
								</button>
							</div>
						</div>
						{error && <p className="mt-3 text-sm text-[#b74935]" role="alert">{error}</p>}
					</form>

					<div className="mt-0 flex flex-wrap items-center gap-x-4 gap-y-3 lg:col-span-2">
						<p className="mb-1 w-full text-xs font-bold uppercase text-[#7c8980] sm:mb-0 sm:w-auto">Need a first thought?</p>
						<div className="flex flex-wrap gap-2">
							{examples.map((example) => (
								<button
									key={example.label}
									className="cursor-pointer rounded-full border border-[#d9dfd4] px-3.5 py-2 text-xs font-semibold text-[#45594d] transition hover:border-[#718b42] hover:bg-[#eef3e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718b42]"
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
					</div>
				</section>
				</div>

				{result && (
					<section ref={resultsRef} className="enter-view mx-auto w-full max-w-[1440px] scroll-mt-6 px-5 sm:px-8 lg:px-14" aria-label="Matching nail ideas" aria-live="polite">
						<div className="flex items-end justify-between gap-4 border-b border-[#d9dfd4] pb-4">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-[#718b42]">From the Nails collection</p>
								<h2 className="mt-1 font-display text-3xl">Closest matches</h2>
							</div>
							<span className="text-xs font-semibold text-[#7c8980]">{matchCountLabel}</span>
						</div>
						{matches.length === 0 ? (
							<p className="mt-4 text-sm leading-6 text-[#617269]">No close matches yet. Try another color, style, or nail shape.</p>
						) : (
							<NailGrid items={visibleMatches} />
						)}
					</section>
				)}
			</main>
		</div>
	);
}