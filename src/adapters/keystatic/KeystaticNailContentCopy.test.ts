import { describe, expect, it } from 'vitest';
import { KeystaticNailRepository } from './KeystaticNailRepository';

function createContentRepository(): KeystaticNailRepository {
	return new KeystaticNailRepository({
		rootPath: process.cwd(),
		imageMetadataResolver: (imagePath) => ({ src: imagePath }),
	});
}

describe('Keystatic nail content copy', () => {
	it('uses natural length-before-shape title order', async () => {
		// Arrange
		const repository = createContentRepository();

		// Act
		const nails = await repository.findAllNails();

		// Assert
		for (const nail of nails) {
			expect(nail.length).toBeDefined();
			expect(nail.shape).toBeDefined();
			if (!nail.length || !nail.shape) continue;
			const titleStart = `${nail.length[0].toUpperCase()}${nail.length.slice(1)} ${nail.shape[0].toUpperCase()}${nail.shape.slice(1)} Nails:`;
			expect(nail.title.startsWith(titleStart)).toBe(true);
		}
	});

	it('keeps design copy sentences unique', async () => {
		// Arrange
		const repository = createContentRepository();

		// Act
		const nails = await repository.findAllNails();

		// Assert
		const sentences = nails.flatMap(({ title, imageAlt, description }) =>
			[title, imageAlt ?? '', description]
				.flatMap((copy) => copy.split(/(?<=[.!?])\s+/))
				.map((sentence) => sentence.trim().toLowerCase())
				.filter(Boolean));
		expect(new Set(sentences).size).toBe(sentences.length);
	});

	it('uses the approved micro French spelling and excludes banned copy', async () => {
		// Arrange
		const repository = createContentRepository();

		// Act
		const nails = await repository.findAllNails();

		// Assert
		for (const nail of nails) {
			const copy = [nail.title, nail.imageAlt, nail.description].join(' ');
			const microFrenchSpellings = copy.match(/\bmicro[\s-]+french\b/gi) ?? [];
			expect(microFrenchSpellings.every((spelling) => spelling === 'micro French')).toBe(true);
			expect(copy).not.toMatch(/flawless/i);
		}
	});
});
