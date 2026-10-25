import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runNailRepositoryContract } from '../contracts/nailRepository.contract';
import { KeystaticNailRepository } from './KeystaticNailRepository';

const fixtureRootPath = fileURLToPath(new URL('./fixtures/content', import.meta.url));

const expectedAllNails = [
	{
		slug: 'b-beta-both',
		title: 'Beta both',
		createdAt: '2026-10-02T12:00',
		updatedAt: '2026-10-03T12:00',
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
	{
		slug: 'a-alpha-manicure',
		title: 'Alpha manicure',
		createdAt: '2026-10-01T12:00',
		updatedAt: '2026-10-01T12:00',
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
		expect(result.find(({ slug }) => slug === 'a-alpha-manicure')?.imageSrc)
			.toContain('short-square-nails-with-solid-color');
		expect(result.find(({ slug }) => slug === 'b-beta-both')?.imageSrc)
			.toContain('short-almond-nails-with-micro-french');
	});
});
