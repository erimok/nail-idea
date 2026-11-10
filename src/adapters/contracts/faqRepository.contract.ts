import { describe, expect, it } from 'vitest';
import type { FaqRepository } from '../../ports/FaqRepository';
import { aFaq } from '../../test/faq-builder';

export function runFaqRepositoryContract(name: string, createRepository: () => FaqRepository, createInvalidRepository: () => FaqRepository): void {
	describe(name, () => {
		it('returns complete FAQ records with facet assignments', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const result = await repository.listFaqs();

			// Assert
			expect(result).toEqual([aFaq()]);
		});

		it('returns independent results on repeated reads', async () => {
			// Arrange
			const repository = createRepository();
			const first = await repository.listFaqs();

			// Act
			const second = await repository.listFaqs();

			// Assert
			expect(second).toEqual(first);
			expect(second).not.toBe(first);
		});

		it('rejects a published FAQ without a full answer', async () => {
			// Arrange
			const repository = createInvalidRepository();

			// Act
			const result = repository.listFaqs();

			// Assert
			await expect(result).rejects.toThrow('requires a question, summary, full answer and meta description');
		});
	});
}
