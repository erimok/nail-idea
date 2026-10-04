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

	it('recognizes effect finishes', () => {
		expect(parser.parse('A sheer jelly manicure with a holographic top coat.'))
			.toEqual(['sheer', 'jelly', 'holographic']);
	});

	it('normalizes magnetic and glazed finishes', () => {
		expect(parser.parse('Cat eye with a glazed donut finish.')).toEqual(['cat-eye', 'glazed']);
	});
});