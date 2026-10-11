import { describe, expect, it } from 'vitest';
import type { NailArea } from '../../domain/areas';
import type { NailRecord } from '../../domain/nail';
import type { NailRepository } from '../../ports/NailRepository';

interface NailRepositoryContractOptions {
	name: string;
	createRepository: () => NailRepository;
	expectedAllNails: readonly NailRecord[];
}

function belongsToArea(nail: NailRecord, area: NailArea): boolean {
	return nail.typesOfNails === area || nail.typesOfNails === 'both';
}

export function runNailRepositoryContract({
	name,
	createRepository,
	expectedAllNails,
}: NailRepositoryContractOptions): void {
	describe(name, () => {
		it('returns all nails in repository order', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const result = await repository.findAllNails();

			// Assert
			expect(result).toEqual(expectedAllNails);
			expect(result).not.toBe(expectedAllNails);
		});

		it('filters nails by area and includes shared records', async () => {
			// Arrange
			const repository = createRepository();
			const expectedManicure = expectedAllNails.filter((nail) => belongsToArea(nail, 'manicure'));
			const expectedPedicure = expectedAllNails.filter((nail) => belongsToArea(nail, 'pedicure'));

			// Act
			const result = {
				manicure: await repository.findNailsByArea('manicure'),
				pedicure: await repository.findNailsByArea('pedicure'),
			};

			// Assert
			expect(result).toEqual({
				manicure: expectedManicure,
				pedicure: expectedPedicure,
			});
		});

		it('returns a fresh array for each query', async () => {
			// Arrange
			const repository = createRepository();

			// Act
			const first = await repository.findAllNails();
			const second = await repository.findAllNails();

			// Assert
			expect(first).toEqual(second);
			expect(first).not.toBe(second);
		});
	});
}
