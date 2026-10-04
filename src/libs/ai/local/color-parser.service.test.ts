import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { ColorsParser } from './color-parser.service';

const parser = new ColorsParser();

describe('ColorsParser', () => {
	it.each(prompts)('parses colors for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.colors);
	});

	it.each([
		{ name: 'empty text', prompt: '' },
		{ name: 'whitespace only', prompt: '   \t  ' },
		{ name: 'a color name inside another word', prompt: 'A blueberry nail design.' },
	])('returns no colors for $name', ({ prompt }) => {
		expect(parser.parse(prompt)).toEqual([]);
	});

	it('keeps a positive color after a negated alternative', () => {
		expect(parser.parse('Not red, but blue.')).toEqual(['blue']);
	});
});