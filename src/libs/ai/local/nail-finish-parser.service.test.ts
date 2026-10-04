import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { NailFinishParser } from './nail-finish-parser.service';

const parser = new NailFinishParser();

describe('NailFinishParser', () => {
	it.each(prompts)('parses finishes for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.finishes);
	});

	it('normalizes finish synonyms', () => {
		expect(parser.parse('A shiny metallic manicure.')).toEqual(['glossy', 'chrome']);
	});
});