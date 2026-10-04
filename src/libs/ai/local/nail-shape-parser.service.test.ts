import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { NailShapeParser } from './nail-shape-parser.service';

const parser = new NailShapeParser();

describe('NailShapeParser', () => {
	it.each(prompts)('parses shape for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.shape ? [expected.shape] : []);
	});

	it('normalizes ballerina to coffin', () => {
		expect(parser.parse('Use a ballerina nail shape.')).toEqual(['coffin']);
	});

	it('recognizes less common nail shapes', () => {
		expect(parser.parse('Try lipstick and mountain peak nails.')).toEqual(['lipstick', 'mountain peak']);
	});
});