import { describe, expect, it } from 'vitest';
import { runNailRepositoryContract } from '../contracts/nailRepository.contract';
import { InMemoryNailRepository } from './InMemoryNailRepository';
import { aNail } from '../../test/builders';

const expectedAllNails = [
	aNail({
		slug: 'alpha-manicure',
		title: 'Alpha manicure',
		image: '/images/nails/alpha.jpg',
		imageSrc: '/assets/alpha.jpg',
		colors: ['red'],
		types: ['solid'],
		occasions: ['party'],
		season: ['summer'],
		shape: 'square',
		length: 'short',
		finishes: ['glossy'],
		typesOfNails: 'manicure',
	}),
	aNail({
		slug: 'beta-both',
		title: 'Beta both',
		image: '/images/nails/beta.jpg',
		imageSrc: '/assets/beta.jpg',
		colors: ['nude'],
		types: ['french'],
		occasions: ['wedding'],
		season: ['spring'],
		shape: 'almond',
		length: 'medium',
		finishes: ['chrome'],
		typesOfNails: 'both',
	}),
] as const;

runNailRepositoryContract({
	name: 'InMemoryNailRepository',
	createRepository: () => new InMemoryNailRepository(expectedAllNails),
	expectedAllNails,
});

describe('InMemoryNailRepository ordering', () => {
	it('returns newest nails first for area-specific queries', async () => {
		// Arrange
		const repository = new InMemoryNailRepository([
			aNail({ slug: 'older-manicure', createdAt: '2026-10-01T12:00:00.000Z' }),
			aNail({ slug: 'newer-shared', createdAt: '2026-10-03T12:00:00.000Z', typesOfNails: 'both' }),
			aNail({ slug: 'middle-pedicure', createdAt: '2026-10-02T12:00:00.000Z', typesOfNails: 'pedicure' }),
		]);

		// Act
		const result = await repository.findNailsByArea('pedicure');

		// Assert
		expect(result.map(({ slug }) => slug)).toEqual(['newer-shared', 'middle-pedicure']);
	});
});
