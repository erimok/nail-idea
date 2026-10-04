import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { SeasonParser } from './season-parser.service';

const parser = new SeasonParser();

describe('SeasonParser', () => {
	it.each(prompts)('parses season for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual([expected.season]);
	});

	it('normalizes fall to autumn', () => {
		expect(parser.parse('A fall manicure.')).toEqual(['autumn']);
	});

	it('returns seasons in order of appearance', () => {
		expect(parser.parse('Summer colors for winter nails.')).toEqual(['summer', 'winter']);
	});
});