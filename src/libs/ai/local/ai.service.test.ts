import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import service from '.';

describe('AIService', () => {
	it.each(prompts)('returns the full response for $name', async ({ prompt, expected }) => {
		await expect(service.parsePrompt(prompt)).resolves.toEqual(expected);
	});

	it('omits season when none is specified', async () => {
		await expect(service.parsePrompt('A red French manicure for a wedding.'))
			.resolves.toEqual({
				colors: ['red'],
				types: ['french'],
				occasions: ['wedding'],
				typesOfNails: 'manicure',
				finishes: [],
				nailConcerns: [],
			});
	});

	it('defaults to manicure when no nail type is specified', async () => {
		await expect(service.parsePrompt('A red French design for spring.'))
			.resolves.toEqual({
				colors: ['red'],
				types: ['french'],
				occasions: [],
				season: 'spring',
				typesOfNails: 'manicure',
				finishes: [],
				nailConcerns: [],
			});
	});

	it('uses static search terms and aliases', async () => {
		await expect(service.parsePrompt('A wine cat eye manicure for fall.'))
			.resolves.toMatchObject({
				colors: ['burgundy'],
				types: ['cat-eye'],
				season: 'autumn',
			});
	});
});