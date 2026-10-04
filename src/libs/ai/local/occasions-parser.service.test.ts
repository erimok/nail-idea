import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { OccasionsParser } from './occasions-parser.service';

const parser = new OccasionsParser();

describe('OccasionsParser', () => {
	it.each(prompts)('parses occasions for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.occasions);
	});
});