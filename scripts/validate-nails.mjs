// Validates nail copy (title, imageAlt, description) against the nail's own metadata.
// Nails listed in docs/validated-nails.md with an unchanged fingerprint are bypassed.
// Usage:
//   node scripts/validate-nails.mjs                      check; skip validated nails
//   node scripts/validate-nails.mjs --all                check everything, ignore the table
//   node scripts/validate-nails.mjs --update             record passing nails in the table
//   node scripts/validate-nails.mjs --update --visual a,b   also mark slugs as visually verified
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('..', import.meta.url));
const nailsDir = join(root, 'src/content/nails');
const imagesDir = join(root, 'src/assets/images');
const tablePath = join(root, 'docs/validated-nails.md');

const SHAPES = ['almond', 'coffin', 'oval', 'square', 'squoval', 'round', 'stiletto'];
const LENGTHS = ['short', 'medium', 'long'];
const COLORS = ['black', 'blue', 'brown', 'burgundy', 'gold', 'green', 'lavender', 'nude', 'orange', 'pink', 'purple', 'red', 'silver', 'white', 'yellow'];
const TYPOS = [/mediul/i, /cay-eye/i, /clause/i, /\bleafs\b/i, /\ba ombre\b/i, /\bfrench\b/, /\bmicro french\b/, /\bMicro french\b/, /\bcat eye\b/i, /\s{2,}/];

const words = (text) => text.toLowerCase().match(/[a-z-]+/g) ?? [];
const fingerprint = (nail) =>
	createHash('sha256')
		.update(JSON.stringify([nail.title, nail.imageAlt, nail.description, nail.image, nail.shape, nail.length, nail.colors, nail.types, nail.finishes]))
		.digest('hex')
		.slice(0, 12);

function readNails() {
	return readdirSync(nailsDir)
		.filter((file) => file.endsWith('.yaml'))
		.sort()
		.map((file) => ({ slug: basename(file, '.yaml'), ...parse(readFileSync(join(nailsDir, file), 'utf8')) }));
}

function readTable() {
	if (!existsSync(tablePath)) return new Map();
	const rows = readFileSync(tablePath, 'utf8')
		.split('\n')
		.map((line) => line.split('|').map((cell) => cell.trim().replace(/^`|`$/g, '')))
		.filter((cells) => cells.length >= 6 && /^[0-9a-f]{12}$/.test(cells[2]));
	return new Map(rows.map((cells) => [cells[1], { hash: cells[2], image: cells[3], date: cells[4] }]));
}

function validate(nail) {
	const problems = [];
	const fields = { title: nail.title, imageAlt: nail.imageAlt, description: nail.description };
	for (const [field, value] of Object.entries(fields)) {
		if (typeof value !== 'string' || value.trim() === '') problems.push(`${field} is empty`);
	}
	if (problems.length) return problems;

	const heading = /^(\w+) (\w+) Nails: .+/.exec(nail.title);
	if (!heading) problems.push('title must follow "{Length} {Shape} Nails: {Design}"');
	else {
		if (heading[1].toLowerCase() !== nail.length) problems.push(`title length "${heading[1]}" differs from length "${nail.length}"`);
		if (heading[2].toLowerCase() !== nail.shape) problems.push(`title shape "${heading[2]}" differs from shape "${nail.shape}"`);
	}

	for (const [field, value] of Object.entries(fields)) {
		const found = words(value);
		for (const shape of SHAPES.filter((s) => found.includes(s) && s !== nail.shape)) problems.push(`${field} mentions shape "${shape}" but shape is "${nail.shape}"`);
		for (const length of LENGTHS.filter((l) => found.includes(l) && l !== nail.length)) problems.push(`${field} mentions length "${length}" but length is "${nail.length}"`);
		for (const typo of TYPOS.filter((pattern) => pattern.test(value))) problems.push(`${field} matches forbidden pattern ${typo}`);
		if (/flawless/i.test(value)) problems.push(`${field} uses "flawless"`);
	}

	const titleWords = words(nail.title.split(':').slice(1).join(':'));
	for (const color of COLORS.filter((c) => titleWords.includes(c) && !nail.colors.includes(c))) problems.push(`title mentions color "${color}" missing from colors`);
	if (/\bfrench\b/i.test(nail.title) && !nail.types.some((type) => type.includes('french'))) problems.push('title mentions French but types has no french style');
	if (/\bombre\b/i.test(nail.title) && !nail.types.includes('ombre')) problems.push('title mentions ombre but types has no ombre');

	if (!existsSync(join(imagesDir, nail.image.replace(/^\/images\//, '')))) problems.push(`image file not found for ${nail.image}`);
	if (nail.imageAlt.trim() === nail.description.trim()) problems.push('imageAlt and description are identical');
	if (nail.finishes.length === 0) problems.push('finishes is empty');
	return problems;
}

function findDuplicates(nails) {
	const problems = new Map();
	for (const field of ['title', 'imageAlt', 'description', 'image']) {
		const seen = new Map();
		for (const nail of nails) {
			const key = String(nail[field]).trim().toLowerCase();
			if (seen.has(key)) {
				for (const slug of [seen.get(key), nail.slug]) problems.set(slug, [...(problems.get(slug) ?? []), `${field} duplicates another nail`]);
			} else seen.set(key, nail.slug);
		}
	}
	return problems;
}

function renderTable(rows) {
	const lines = [
		'# Validated nails',
		'',
		'Nails whose copy (title, imageAlt, description) and tags were validated by `scripts/validate-nails.mjs`.',
		'A nail is bypassed while its fingerprint matches; any change to the validated fields makes it stale and it is checked again.',
		'`visual` means a person or agent compared the photo with the copy. `text` means only the copy and tags were checked.',
		'',
		'| Slug | Fingerprint | Image check | Validated |',
		'|---|---|---|---|',
		...rows.map((row) => `| ${row.slug} | \`${row.hash}\` | ${row.image} | ${row.date} |`),
		'',
	];
	return lines.join('\n');
}

const args = process.argv.slice(2);
const update = args.includes('--update');
const checkAll = args.includes('--all');
const visualArg = args.indexOf('--visual');
const visual = new Set(visualArg >= 0 ? (args[visualArg + 1] ?? '').split(',').filter(Boolean) : []);

const nails = readNails();
const table = readTable();
const duplicates = findDuplicates(nails);
const today = new Date().toISOString().slice(0, 10);
const failures = [];
const rows = [];
let bypassed = 0;

for (const nail of nails) {
	const hash = fingerprint(nail);
	const known = table.get(nail.slug);
	if (!checkAll && !update && known?.hash === hash) {
		bypassed += 1;
		rows.push({ slug: nail.slug, ...known });
		continue;
	}
	const problems = [...validate(nail), ...(duplicates.get(nail.slug) ?? [])];
	if (problems.length) failures.push({ slug: nail.slug, problems });
	else rows.push({ slug: nail.slug, hash, image: visual.has(nail.slug) ? 'visual' : (known?.image ?? 'text'), date: known?.hash === hash ? known.date : today });
}

if (failures.length) {
	for (const { slug, problems } of failures) console.error(`${slug}\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
	console.error(`\n${failures.length} nail(s) failed validation.`);
	process.exitCode = 1;
} else {
	console.log(`${nails.length - bypassed} validated, ${bypassed} bypassed via docs/validated-nails.md.`);
	if (update) {
		writeFileSync(tablePath, renderTable(rows));
		console.log(`Wrote ${rows.length} rows to docs/validated-nails.md.`);
	}
}
