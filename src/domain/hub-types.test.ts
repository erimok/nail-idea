import { describe, expect, it } from 'vitest';
import type { HubEditorial } from './hub-types';

describe('domain hub types', () => {
	it('models curated hub editorial content', () => {
		// Arrange
		const editorial: HubEditorial = {
			area: 'manicure',
			urlSlug: 'red-nails',
			intro: 'Curated intro.',
			metaDescription: 'Curated description.',
			faq: [{ question: 'What is a red manicure?', answer: 'A manicure with red polish.' }],
		};

		// Act
		const result = editorial.faq[0];

		// Assert
		expect(result).toEqual({
			question: 'What is a red manicure?',
			answer: 'A manicure with red polish.',
		});
	});
});
