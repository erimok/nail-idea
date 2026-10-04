import { useState, type SubmitEvent } from 'react';
import type { IAIResponse } from '../libs/ai/types';
import { searchNails, type NailRecord } from '../libs/ai/nail-search';
import aiService from '../libs/ai/local';

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

function getResultRows(result: IAIResponse) {
	return [
		{ label: 'Nail service', values: [result.typesOfNails] },
		{ label: 'Colors', values: result.colors },
		{ label: 'Design', values: result.types },
		{ label: 'Occasion', values: result.occasions ?? [] },
		{ label: 'Season', values: result.season ? [result.season] : [] },
		{ label: 'Shape', values: result.shape ? [result.shape] : [] },
		{ label: 'Length', values: result.length ? [result.length] : [] },
		{ label: 'Finish', values: result.finishes ?? [] },
		{ label: 'Nail care notes', values: result.nailConcerns ?? [] },
	].filter(({ values }) => values.length > 0);
}

export default function IdeaExplorer({ nails = [] }: { nails?: readonly NailRecord[] }) {
	const [prompt, setPrompt] = useState('');
	const [result, setResult] = useState<IAIResponse | null>(null);
	const [error, setError] = useState('');
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const matches = result ? searchNails(result, nails) : [];
	const visibleMatches = matches.slice(0, 3);

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
		<div className="min-h-screen overflow-hidden bg-[#f5f6f0] text-[#172b24]">
			<header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-14">
				<a className="flex items-center gap-3" href="/" aria-label="Nail.ai home">
					<span className="grid size-9 place-items-center rounded-full bg-[#c9f36a] font-display text-xl font-bold text-[#172b24]">n</span>
					<span className="text-lg font-bold tracking-normal">nail.ai</span>
				</a>
				<div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#617269]">
					<span className="hidden sm:inline">Idea studio</span>
					<span className="size-1.5 rounded-full bg-[#d6694c]" aria-hidden="true" />
					<a className="transition-colors hover:text-[#172b24]" href="/keystatic">Editor</a>
				</div>
			</header>

			<main className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 pb-12 pt-5 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:gap-16 lg:px-14 lg:pb-16 lg:pt-10">
				<section className="enter-view flex flex-col justify-center lg:py-8" aria-labelledby="page-title">
					<p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d6694c]">
						<span className="h-px w-8 bg-[#d6694c]" aria-hidden="true" />
						Your next set starts here
					</p>
					<h1 id="page-title" className="max-w-xl font-display text-5xl leading-[1.04] sm:text-6xl lg:text-[4.5rem]">
						A little idea.
						<span className="mt-1 block text-[#718b42]">A look all yours.</span>
					</h1>
					<p className="mt-6 max-w-lg text-base leading-7 text-[#617269] sm:text-lg">
						Describe the manicure or pedicure on your mind. We’ll pick out the colors, shape, finish, and details.
					</p>

					<form className="mt-9" onSubmit={handleSubmit}>
						<label htmlFor="idea-prompt" className="mb-2 block text-sm font-bold text-[#172b24]">
							What are you imagining?
						</label>
						<div className="rounded-[1.25rem] border border-[#d9dfd4] bg-white p-4 shadow-[0_18px_55px_-38px_rgba(23,43,36,0.45)] transition-shadow focus-within:border-[#718b42] focus-within:shadow-[0_18px_55px_-30px_rgba(113,139,66,0.35)] sm:p-5">
							<textarea
								id="idea-prompt"
								aria-describedby="prompt-hint prompt-count"
								aria-label="Describe your nail idea"
								className="min-h-32 w-full resize-y border-0 bg-transparent text-base leading-7 text-[#172b24] outline-none placeholder:text-[#9aa69d] focus:ring-0"
								maxLength={400}
								placeholder="Try: short almond nails, glossy red French tips for a spring wedding…"
								value={prompt}
								onChange={(event) => {
									setPrompt(event.target.value);
									setError('');
									setResult(null);
								}}
							/>
							<div className="mt-3 flex items-center justify-between gap-4 border-t border-[#edf0e9] pt-4">
								<span id="prompt-hint" className="text-xs leading-5 text-[#7c8980]">Color, shape, mood, occasion — any detail helps.</span>
								<span id="prompt-count" className="shrink-0 text-xs tabular-nums text-[#89968d]">{prompt.length}/400</span>
							</div>
							<button
								className="mt-4 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#172b24] px-5 text-sm font-bold text-white transition hover:bg-[#304a3c] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#718b42] disabled:cursor-not-allowed disabled:bg-[#b5beb6]"
								disabled={!prompt.trim() || isAnalyzing}
								type="submit"
							>
								{isAnalyzing ? 'Reading your idea…' : 'Analyze this idea'}
								<span aria-hidden="true">↗</span>
							</button>
						</div>
						{error && <p className="mt-3 text-sm text-[#b74935]" role="alert">{error}</p>}
					</form>

					<div className="mt-6">
						<p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#7c8980]">Need a first thought?</p>
						<div className="flex flex-wrap gap-2">
							{examples.map((example) => (
								<button
									key={example.label}
									className="rounded-full border border-[#d9dfd4] px-3.5 py-2 text-xs font-semibold text-[#45594d] transition hover:border-[#718b42] hover:bg-[#eef3e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718b42]"
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

				<section className="enter-view flex flex-col gap-5 [animation-delay:100ms]" aria-label="Manicure inspiration and analysis">
					<figure className="group relative min-h-[420px] overflow-hidden rounded-[1.5rem] bg-[#dce5d3] sm:min-h-[500px] lg:min-h-[640px]">
						<img
							alt="A close-up manicure inspiration in soft natural light"
							className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
							decoding="async"
							height="1200"
							loading="eager"
							src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1400&q=85"
							width="1000"
						/>
						<figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[#15251f]/75 via-[#15251f]/20 to-transparent p-6 pt-24 text-white sm:p-8 sm:pt-28">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d6f59e]">Inspiration, in the details</p>
								<p className="mt-2 max-w-sm font-display text-3xl leading-tight sm:text-4xl">Find your next favorite.</p>
							</div>
							<span className="hidden size-12 shrink-0 place-items-center rounded-full border border-white/55 text-lg sm:grid" aria-hidden="true">↘</span>
						</figcaption>
					</figure>

					{result && (
						<div className="enter-view border-t border-[#d9dfd4] pt-5" role="region" aria-label="Idea analysis" aria-live="polite">
							<div className="flex items-end justify-between gap-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.14em] text-[#718b42]">Your idea, decoded</p>
									<h2 className="mt-1 font-display text-3xl">The details</h2>
								</div>
								<span className="text-xs font-semibold text-[#7c8980]">{getResultRows(result).length} traits</span>
							</div>
							<dl className="mt-5 divide-y divide-[#dfe4dc]">
								{getResultRows(result).map(({ label, values }) => (
									<div className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1fr)] gap-4 py-3 first:pt-0" key={label}>
										<dt className="text-sm text-[#7c8980]">{label}</dt>
										<dd className="flex flex-wrap gap-2 text-sm font-semibold capitalize text-[#172b24]">
											{values.map((value) => <span key={value}>{value}</span>)}
										</dd>
									</div>
								))}
							</dl>
						</div>
					)}

					{result && (
						<section className="enter-view border-t border-[#d9dfd4] pt-5" aria-label="Matching nail ideas" aria-live="polite">
							<div className="flex items-end justify-between gap-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-[0.14em] text-[#718b42]">From the Nails collection</p>
									<h2 className="mt-1 font-display text-3xl">Closest matches</h2>
								</div>
								<span className="text-xs font-semibold text-[#7c8980]">{matches.length} found</span>
							</div>
							{matches.length === 0 ? (
								<p className="mt-4 text-sm leading-6 text-[#617269]">No close matches yet. Try another color, style, or nail shape.</p>
							) : (
								<div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
										{visibleMatches.map(({ nail, score }) => (
										<article className="overflow-hidden rounded-xl border border-[#d9dfd4] bg-white" key={nail.slug}>
											<img
												alt={nail.title}
												className="aspect-[4/3] w-full object-cover"
												decoding="async"
												loading="lazy"
												src={nail.image}
											/>
											<div className="p-4">
												<div className="flex items-start justify-between gap-3">
													<h3 className="font-display text-xl leading-tight">{nail.title}</h3>
													<span className="shrink-0 text-xs font-semibold tabular-nums text-[#718b42]">{Math.round(score * 100)}%</span>
												</div>
												<p className="mt-2 text-sm leading-5 text-[#617269]">{nail.description}</p>
											</div>
										</article>
									))}
								</div>
							)}
						</section>
					)}
				</section>
			</main>
		</div>
	);
}