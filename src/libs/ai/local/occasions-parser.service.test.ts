import { describe, expect, it } from 'vitest';
import { prompts } from '../fixtures/prompts';
import { OccasionsParser } from './occasions-parser.service';

const parser = new OccasionsParser();

describe('OccasionsParser', () => {
	it.each(prompts)('parses occasions for $name', ({ prompt, expected }) => {
		expect(parser.parse(prompt)).toEqual(expected.occasions);
	});

	it('recognizes seasonal, work, and social occasions', () => {
		expect(parser.parse("Office-ready nails for Halloween, New Year's Eve, and Mother's Day."))
			.toEqual(['office', 'halloween', 'new year', 'mothers day']);
	});
});