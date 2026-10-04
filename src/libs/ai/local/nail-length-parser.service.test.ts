import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { NailLengthParser } from './nail-length-parser.service';

const parser = new NailLengthParser();

describe('NailLengthParser', () => {
	it.each(prompts)('parses length for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.length ? [expected.length] : []);
	});

	it.each([
		{ prompt: 'Extra short nails.', expected: ['short'] },
		{ prompt: 'Extra long nails.', expected: ['long'] },
		{ prompt: 'Medium-length nails.', expected: ['medium'] },
	])('normalizes $prompt', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected);
	});
});