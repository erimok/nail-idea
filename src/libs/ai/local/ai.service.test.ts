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
			});
	});
});