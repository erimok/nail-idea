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
