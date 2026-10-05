import { describe, expect, it } from 'vitest';
import { validateNailContent } from './dev-nail-content-endpoint';
import { readFileSync } from 'node:fs';

const validEntry = {
	title: 'Coral French Tips',
	image: 'https://example.com/nails.jpg',
	description: 'Glossy coral nails with white French tips.',
	typesOfNails: 'manicure',
	colors: ['coral', 'white'],
	types: ['french'],
	occasions: [],
	season: [],
	shape: 'almond',
	length: 'medium',
	finishes: ['glossy'],
	nailConcerns: [],
};

describe('validateNailContent', () => {
	it('accepts a complete entry using canonical values', () => {
		expect(validateNailContent(validEntry)).toEqual({ entry: validEntry, errors: [] });
	});

	it('rejects aliases and values outside the collection vocabulary', () => {
		const result = validateNailContent({ ...validEntry, colors: ['hot pink'], shape: 'ballerina' });

		expect(result.entry).toBeUndefined();
		expect(result.errors).toContain('colors must be an array of allowed canonical values.');
		expect(result.errors).toContain('shape must be one of: almond, coffin, duck, flare, lipstick, mountain peak, oval, round, squoval, square, stiletto.');
	});

	it('rejects missing and unexpected fields', () => {
		const { season: _season, ...missingSeason } = validEntry;
		const result = validateNailContent({ ...missingSeason, extra: true });

		expect(result.errors).toContain('Missing required field: season.');
		expect(result.errors).toContain('Unexpected field: extra.');
	});

	it('rejects non-web image URLs', () => {
		const result = validateNailContent({ ...validEntry, image: 'file:///tmp/nails.jpg' });

		expect(result.errors).toContain('image must use http or https.');
	});

	it('keeps the documented JSON and HTTP request examples valid', () => {
		const jsonExample = JSON.parse(readFileSync(new URL('../../examples/nail-entry.json', import.meta.url), 'utf8'));
		const httpFile = readFileSync(new URL('../../examples/nails.http', import.meta.url), 'utf8');
		const httpExamples = [...httpFile.matchAll(/Content-Type: application\/json\r?\n\r?\n([\s\S]*?)(?=\r?\n###|$)/g)]
			.map(([, body]) => JSON.parse(body.trim()));

		expect(validateNailContent(jsonExample).errors).toEqual([]);
		expect(httpExamples).toHaveLength(2);
		for (const example of httpExamples) {
			expect(validateNailContent(example).errors).toEqual([]);
		}
	});
});