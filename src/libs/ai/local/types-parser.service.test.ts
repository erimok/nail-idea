import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { TypesParser } from './types-parser.service';

const parser = new TypesParser();

describe('TypesParser', () => {
	it.each(prompts)('parses design types for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.types);
	});

	it('matches accented style aliases', () => {
		expect(parser.parse('Try an ombré nail design.')).toEqual(['ombre']);
	});
});