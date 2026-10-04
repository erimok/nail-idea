import { describe, expect, it } from 'vitest';
import { AIPasrseError } from '../index';
import { prompts } from '../fixtures/prompts';
import { AIService } from './ai.service';
import { ColorsParser } from './color-parser.service';
import { OccasionsParser } from './occasions-parser.service';
import { SeasonParser } from './season-parser.service';
import { TypesOfNailsParser } from './types-of-nails-parser.service';
import { TypesParser } from './types-parser.service';

const service = new AIService(
	new ColorsParser(),
	new TypesParser(),
	new OccasionsParser(),
	new SeasonParser(),
	new TypesOfNailsParser(),
);

describe('AIService', () => {
	it.each(prompts)('returns the full response for $name', async ({ prompt, expected }) => {
		await expect(service.parsePrompt(prompt)).resolves.toEqual(expected);
	});

	it('throws when the prompt has no season', async () => {
		await expect(service.parsePrompt('A red French manicure for a wedding.'))
			.rejects.toBeInstanceOf(AIPasrseError);
	});

	it('throws when the prompt has no manicure or pedicure type', async () => {
		await expect(service.parsePrompt('A red French design for spring.'))
			.rejects.toBeInstanceOf(AIPasrseError);
	});
});