import type { ImageMetadata } from 'astro';

const nailImages = import.meta.glob<ImageMetadata>(
	'../assets/images/nails/**/*.{avif,gif,jpeg,jpg,png,webp}',
	{ eager: true, import: 'default' },
);

export function getNailImageMetadata(imagePath: string): ImageMetadata {
	const publicPrefix = '/images/nails/';
	if (!imagePath.startsWith(publicPrefix)) {
		throw new Error(`Unsupported nail image path: ${imagePath}`);
	}

	const assetPath = `../assets/images/nails/${imagePath.slice(publicPrefix.length)}`;
	const image = nailImages[assetPath];
	if (!image) {
		throw new Error(`Nail image asset not found for ${imagePath}`);
	}

	return image;
}