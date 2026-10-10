import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { exiftool } from 'exiftool-vendored';

const sourceDirectory = join(process.cwd(), 'src/assets/images/nails');
const outputDirectory = join(process.cwd(), 'dist/client/_astro');
const generatedImages = await readdir(outputDirectory);
const sourceEntries = await readdir(sourceDirectory, { withFileTypes: true });
const digitalSourceType = 'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia';
const description = 'AI-generated nail design image for visual inspiration.';
const instructions = 'Created using generative AI; not a photograph of a real manicure or pedicure.';
let sourceCount = 0;
let generatedCount = 0;
const writeMetadata = (file, tags) => exiftool.write(file, tags, { writeArgs: ['-overwrite_original'] });

try {
	for (const entry of sourceEntries) {
		if (!entry.isDirectory()) continue;

		const sourceImage = join(sourceDirectory, entry.name, `${entry.name}.jpg`);
		await writeMetadata(sourceImage, {
			'IPTC:Caption-Abstract': description,
			'IPTC:SpecialInstructions': instructions,
			'IPTC:Keywords': ['AI-generated', 'nail design', 'manicure'],
			'XMP-dc:Description': description,
			'XMP-photoshop:Instructions': instructions,
			'XMP-iptcExt:DigitalSourceType': digitalSourceType,
		});
		const sourceMetadata = await exiftool.read(sourceImage);
		if (!sourceMetadata['Caption-Abstract'] || !sourceMetadata.DigitalSourceType) {
			throw new Error(`IPTC metadata missing from ${sourceImage}`);
		}
		sourceCount += 1;

		const variants = generatedImages.filter((filename) =>
			filename.startsWith(`${entry.name}.`) && /\.(avif|webp)$/.test(filename),
		);
		for (const filename of variants) {
			const outputImage = join(outputDirectory, filename);
			await writeMetadata(outputImage, {
				'XMP-dc:Description': description,
				'XMP-photoshop:Instructions': instructions,
				'XMP-iptcExt:DigitalSourceType': digitalSourceType,
			});
			const outputMetadata = await exiftool.read(outputImage);
			if (
				outputMetadata.Description !== description
				|| outputMetadata.Instructions !== instructions
				|| outputMetadata.DigitalSourceType !== digitalSourceType
			) {
				throw new Error(`IPTC/XMP metadata missing from ${outputImage}`);
			}
			generatedCount += 1;
		}
	}
} finally {
	await exiftool.end();
}

console.log(`Embedded IPTC/XMP metadata in ${sourceCount} source images and ${generatedCount} generated images.`);