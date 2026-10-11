import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runNailRepositoryContract } from '../contracts/nailRepository.contract';
import { KeystaticNailRepository } from './KeystaticNailRepository';

const fixtureRootPath = fileURLToPath(new URL('./fixtures/content', import.meta.url));

const expectedAllNails = [
	{
		slug: 'a-alpha-manicure',
		title: 'Alpha manicure',
		image: '/images/nails/short-square-nails-with-solid-color/short-square-nails-with-solid-color.jpg',
		imageSrc: 'mapped:/images/nails/short-square-nails-with-solid-color/short-square-nails-with-solid-color.jpg',
		imageAlt: 'Alpha manicure alt text.',
		description: 'Alpha manicure description.',
		colors: ['red'],
		types: ['solid'],
		occasions: ['party'],
		season: ['summer'],
		shape: 'square',
		length: 'short',
		finishes: ['glossy'],
		nailConcerns: [],
		typesOfNails: 'manicure',
	},
	{
		slug: 'b-beta-both',
		title: 'Beta both',
		image: '/images/nails/short-almond-nails-with-micro-french/short-almond-nails-with-micro-french.jpg',
		imageSrc: 'mapped:/images/nails/short-almond-nails-with-micro-french/short-almond-nails-with-micro-french.jpg',
		imageAlt: 'Beta both alt text.',
		description: 'Beta both description.',
		colors: ['nude'],
		types: ['french'],
		occasions: ['wedding'],
		season: ['spring'],
		shape: 'almond',
		length: 'medium',
		finishes: ['chrome'],
		nailConcerns: ['brittle'],
		typesOfNails: 'both',
	},
] as const;

runNailRepositoryContract({
	name: 'KeystaticNailRepository',
	createRepository: () => new KeystaticNailRepository({
		rootPath: fixtureRootPath,
		imageMetadataResolver: (imagePath) => ({ src: `mapped:${imagePath}` }),
	}),
	expectedAllNails,
});

describe('KeystaticNailRepository', () => {
	it('maps image metadata through the nail image adapter by default', async () => {
		// Arrange
		const repository = new KeystaticNailRepository({ rootPath: fixtureRootPath });

		// Act
		const result = await repository.findAllNails();

		// Assert
		expect(result[0].imageSrc).toContain('short-square-nails-with-solid-color');
		expect(result[1].imageSrc).toContain('short-almond-nails-with-micro-french');
	});
});
