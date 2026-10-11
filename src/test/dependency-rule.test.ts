import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceDirectories = ['src/domain', 'src/application'];
const importPattern = /\bfrom\s+['"]([^'"]+)['"]|^\s*import\s+['"]([^'"]+)['"]/gm;

function listSourceFiles(directory: string): string[] {
	if (!existsSync(directory)) return [];

	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = join(directory, entry.name);

		if (entry.isDirectory()) {
			return listSourceFiles(entryPath);
		}

		return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')
			? [entryPath]
			: [];
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
		const files = sourceDirectories.flatMap((directory) => listSourceFiles(join(process.cwd(), directory)));

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
});
