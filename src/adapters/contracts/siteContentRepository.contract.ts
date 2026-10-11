import { describe, expect, it } from 'vitest';
import type { FaqEntry, NavigationGroup } from '../../domain/site-content';
import type { SiteContentRepository } from '../../ports/SiteContentRepository';

interface SiteContentRepositoryContractOptions {
	name: string;
	createRepository: () => SiteContentRepository;
	expectedFaqs: readonly FaqEntry[];
	expectedNavigationGroups: readonly NavigationGroup[];
}

export function runSiteContentRepositoryContract({
	name,
	createRepository,
	expectedFaqs,
	expectedNavigationGroups,
}: SiteContentRepositoryContractOptions): void {
	describe(name, () => {
		it('lists FAQ records in display order', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const result = await repository.listFaqs();

			// Assert
			expect(result).toEqual(expectedFaqs);
		});

		it('lists navigation groups in display order', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const result = await repository.listNavigationGroups();

			// Assert
			expect(result).toEqual(expectedNavigationGroups);
		});

		it('returns fresh arrays for each query', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const firstFaqs = await repository.listFaqs();
			const secondFaqs = await repository.listFaqs();
			const firstGroups = await repository.listNavigationGroups();
			const secondGroups = await repository.listNavigationGroups();

			// Assert
			expect(firstFaqs).not.toBe(secondFaqs);
			expect(firstGroups).not.toBe(secondGroups);
		});
	});
}
