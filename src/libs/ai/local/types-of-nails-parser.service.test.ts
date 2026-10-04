import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { TypesOfNailsParser } from './types-of-nails-parser.service';

const parser = new TypesOfNailsParser();

describe('TypesOfNailsParser', () => {
	it.each(prompts)('parses nail type for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual([expected.typesOfNails]);
	});

	it('returns no nail type when none is mentioned', () => {
		expect(parser.parse('A red design for spring.')).toEqual([]);
	});

	it('recognizes common service abbreviations', () => {
		expect(parser.parse('A mani and pedi set.')).toEqual(['both']);
	});
});