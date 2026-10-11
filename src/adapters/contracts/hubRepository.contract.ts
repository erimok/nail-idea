import { describe, expect, it } from 'vitest';
import type { HubEditorial } from '../../domain/hub-types';
import type { HubRepository } from '../../ports/HubRepository';

interface HubRepositoryContractOptions {
	name: string;
	createRepository: () => HubRepository;
	expectedHubs: readonly HubEditorial[];
}

export function runHubRepositoryContract({
	name,
	createRepository,
	expectedHubs,
}: HubRepositoryContractOptions): void {
	describe(name, () => {
		it('lists hubs in repository order', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const result = await repository.listHubs();

			// Assert
			expect(result).toEqual(expectedHubs);
			expect(result).not.toBe(expectedHubs);
		});

		it('gets a hub by area and slug', async () => {
			// Arrange
			const repository = createRepository();
			const expectedHub = expectedHubs[0];

			// Act
			const result = await repository.getHub(expectedHub.area, expectedHub.urlSlug);

			// Assert
			expect(result).toEqual(expectedHub);
		});

		it('returns null when a hub is missing', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const result = await repository.getHub('manicure', 'missing-hub');

			// Assert
			expect(result).toBeNull();
		});

		it('returns a fresh array for each list query', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const first = await repository.listHubs();
			const second = await repository.listHubs();

			// Assert
			expect(first).toEqual(second);
			expect(first).not.toBe(second);
		});
	});
}
