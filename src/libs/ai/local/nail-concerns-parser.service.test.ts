import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { NailConcernsParser } from './nail-concerns-parser.service';

const parser = new NailConcernsParser();

describe('NailConcernsParser', () => {
	it.each(prompts)('parses nail concerns for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.nailConcerns);
	});

	it('normalizes weakness to weak', () => {
		expect(parser.parse('I have nail weakness.')).toEqual(['weak']);
	});

	it('recognizes splitting and bitten nail concerns', () => {
		expect(parser.parse('My nails are splitting and bitten.')).toEqual(['split', 'bitten']);
	});
});