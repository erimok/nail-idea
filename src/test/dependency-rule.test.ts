import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceDirectories = ['src/domain', 'src/application'];
const astroDirectories = ['src/components', 'src/layouts', 'src/pages'];
const importPattern = /\bfrom\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm;
const repositoryConstructionPattern = /new\s+([A-Za-z0-9_]+Repository)\b/g;

function listFiles(directory: string, extensions: readonly string[], includeTests = false): string[] {
	if (!existsSync(directory)) return [];

	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = join(directory, entry.name);

		if (entry.isDirectory()) {
			return listFiles(entryPath, extensions, includeTests);
		}

		const matchesExtension = extensions.some((extension) => entry.name.endsWith(extension));
		const isTestFile = /\.test\.[^.]+$/.test(entry.name);
		if (!matchesExtension || (!includeTests && isTestFile)) return [];

		return [entryPath];
	});
}

function isProhibitedImport(specifier: string): boolean {
	return specifier === 'astro'
		|| specifier.startsWith('astro:')
		|| specifier.startsWith('@keystatic/')
		|| specifier === 'fs'
		|| specifier === 'node:fs'
		|| /(^|\/)adapters(\/|$)/.test(specifier)
		|| specifier.endsWith('.astro');
}

describe('dependency rule', () => {
	it('keeps domain and application free of framework and adapter imports', () => {
		// Arrange
		const files = sourceDirectories.flatMap((directory) => listFiles(join(process.cwd(), directory), ['.ts']));

		// Act
		const violations = files.flatMap((file) => {
			const contents = readFileSync(file, 'utf8');
			const matches = [...contents.matchAll(importPattern)]
				.map((match) => match[1] ?? match[2])
				.filter((specifier): specifier is string => specifier !== undefined);

			return matches
				.filter((specifier) => isProhibitedImport(specifier))
				.map((specifier) => `${relative(process.cwd(), file)} -> ${specifier}`);
		});

		// Assert
		expect(violations).toEqual([]);
	});

	it('keeps Astro files free of direct data-source imports and fetch calls', () => {
		// Arrange
		const files = astroDirectories.flatMap((directory) => listFiles(join(process.cwd(), directory), ['.astro']));

		// Act
		const violations = files.flatMap((file) => {
			const contents = readFileSync(file, 'utf8');
			const imports = [...contents.matchAll(importPattern)]
				.map((match) => match[1] ?? match[2])
				.filter((specifier): specifier is string => specifier !== undefined)
				.filter((specifier) => specifier === 'astro:content' || specifier.startsWith('@keystatic/') || specifier === 'fs' || specifier === 'node:fs')
				.map((specifier) => `${relative(process.cwd(), file)} -> ${specifier}`);
			const fetchUsage = /\bfetch\s*\(/.test(contents)
				? [`${relative(process.cwd(), file)} -> fetch()`]
				: [];

			return [...imports, ...fetchUsage];
		});

		// Assert
		expect(violations).toEqual([]);
	});

	it('allows repository construction only in adapters and the composition root', () => {
		// Arrange
		const files = listFiles(join(process.cwd(), 'src'), ['.ts', '.astro']);

		// Act
		const violations = files.flatMap((file) => {
			const contents = readFileSync(file, 'utf8');
			const matches = [...contents.matchAll(repositoryConstructionPattern)].map((match) => match[1]);
			const allowed = /src\/(adapters\/|composition\.ts$)/.test(relative(process.cwd(), file));

			return allowed
				? []
				: matches.map((constructorName) => `${relative(process.cwd(), file)} -> ${constructorName}`);
		});

		// Assert
		expect(violations).toEqual([]);
	});
});
