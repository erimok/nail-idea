// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import IdeaExplorer from './IdeaExplorer';
import type { NailSearchRecord } from '../libs/ai/nail-search';

afterEach(cleanup);

describe('IdeaExplorer', () => {
	it('starts with the page context when an initial prompt is provided', () => {
		render(<IdeaExplorer initialPrompt="red manicure ideas" />);

		expect((screen.getByRole('textbox', { name: 'Describe your nail idea' }) as HTMLTextAreaElement).value)
			.toBe('red manicure ideas');
	});

	it('disables analysis until the prompt contains text', async () => {
		const user = userEvent.setup();
		render(<IdeaExplorer />);

		const prompt = screen.getByRole('textbox', { name: 'Describe your nail idea' });
		const submit = screen.getByRole('button', { name: /find my designs/i });

		expect((submit as HTMLButtonElement).disabled).toBe(true);
		await user.type(prompt, '   ');
		expect((submit as HTMLButtonElement).disabled).toBe(true);
		await user.type(prompt, ' red nails');
		expect((submit as HTMLButtonElement).disabled).toBe(false);
	});

	it('loads a starter prompt into the form', async () => {
		const user = userEvent.setup();
		render(<IdeaExplorer />);

		await user.click(screen.getByRole('button', { name: 'Short burgundy' }));

		expect((screen.getByRole('textbox', { name: 'Describe your nail idea' }) as HTMLTextAreaElement).value)
			.toBe('Short burgundy almond nails with a micro French manicure.');
	});

	it('shows only three cards and reports the total match count', async () => {
		const user = userEvent.setup();
		const matchingNail: NailSearchRecord = {
			slug: 'bridal-french',
			title: 'Bridal French',
			description: 'A crisp French manicure for a spring wedding.',
			typesOfNails: 'manicure',
			colors: ['red', 'white'],
			types: ['french'],
			occasions: ['wedding'],
			season: 'spring',
			shape: 'almond',
			length: 'short',
			finishes: ['glossy'],
			nailConcerns: [],
		};
		const nails = Array.from({ length: 4 }, (_, index) => ({
			...matchingNail,
			slug: `bridal-french-${index + 1}`,
			title: `Bridal French ${index + 1}`,
		}));
		render(<IdeaExplorer nails={nails} />);

		await user.type(
			screen.getByRole('textbox', { name: 'Describe your nail idea' }),
			'Short almond nails, glossy red French manicure for a spring wedding.',
		);
		await user.click(screen.getByRole('button', { name: /find my designs/i }));

		const results = await screen.findByRole('region', { name: 'Matching nail ideas' });
		expect(results.textContent).toContain('Showing 3 of 4 matches');
		expect(results.querySelectorAll('article')).toHaveLength(3);
		expect(screen.queryByText('Your idea, decoded')).toBeNull();
	});

	it('shows matching nails from the CMS collection', async () => {
		const user = userEvent.setup();
		const nails: NailSearchRecord[] = [{
			slug: 'bridal-french',
			title: 'Bridal French',
			description: 'A crisp French manicure for a spring wedding.',
			typesOfNails: 'manicure',
			colors: ['red', 'white'],
			types: ['french'],
			occasions: ['wedding'],
			season: 'spring',
			shape: 'almond',
			length: 'short',
			finishes: ['glossy'],
			nailConcerns: [],
		}];
		render(<IdeaExplorer nails={nails} />);

		await user.type(
			screen.getByRole('textbox', { name: 'Describe your nail idea' }),
			'Short almond nails, glossy red French manicure for a spring wedding.',
		);
		await user.click(screen.getByRole('button', { name: /find my designs/i }));

		const results = await screen.findByRole('region', { name: 'Matching nail ideas' });
		expect(results.textContent).toContain('Bridal French');
		expect(results.textContent).toContain('100%');
	});

	it('smoothly scrolls to matching ideas after analysis', async () => {
		const user = userEvent.setup();
		const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
		const scrollIntoView = vi.fn();
		Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
			configurable: true,
			value: scrollIntoView,
		});
		render(<IdeaExplorer />);

		try {
			await user.type(
				screen.getByRole('textbox', { name: 'Describe your nail idea' }),
				'Short almond nails in glossy red.',
			);
			await user.click(screen.getByRole('button', { name: /find my designs/i }));
			await screen.findByRole('region', { name: 'Matching nail ideas' });

			expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
		} finally {
			if (originalDescriptor) {
				Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalDescriptor);
			} else {
				delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
			}
		}
	});

	it('links to the matching collection page from the results', async () => {
		const user = userEvent.setup();
		const nail: NailSearchRecord = {
			slug: 'nude-almond',
			title: 'Nude almond',
			description: 'A soft nude set.',
			typesOfNails: 'manicure',
			colors: ['nude'],
			types: [],
			occasions: [],
			shape: 'almond',
			length: 'short',
			finishes: [],
			nailConcerns: [],
		};
		const hubLinks = [{
			area: 'manicure' as const,
			facets: [{ kind: 'color' as const, value: 'nude' }, { kind: 'shape' as const, value: 'almond' }],
			href: '/manicure/nude-almond-nails/',
			label: 'nude almond nails',
			designCount: 8,
		}];
		render(<IdeaExplorer nails={[nail]} hubLinks={hubLinks} />);

		await user.type(screen.getByRole('textbox', { name: 'Describe your nail idea' }), 'Short nude almond nails.');
		await user.click(screen.getByRole('button', { name: /find my designs/i }));

		const link = await screen.findByRole('link', { name: /show more nude almond nails/i });
		expect(link.getAttribute('href')).toBe('/manicure/nude-almond-nails/');
	});

	it('omits the collection link when no hub fits the search', async () => {
		const user = userEvent.setup();
		render(<IdeaExplorer nails={[]} hubLinks={[]} />);

		await user.type(screen.getByRole('textbox', { name: 'Describe your nail idea' }), 'Short nude almond nails.');
		await user.click(screen.getByRole('button', { name: /find my designs/i }));

		await screen.findByRole('region', { name: 'Matching nail ideas' });
		expect(screen.queryByRole('link', { name: /show more/i })).toBeNull();
	});
});
