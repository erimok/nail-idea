import { describe, expect, it } from 'vitest';
import { aiSearchOptions } from './vocabulary';

describe('aiSearchOptions', () => {
	it('covers canonical values for every AI response category', () => {
		expect(aiSearchOptions.colors).toEqual(expect.arrayContaining(['fuchsia', 'turquoise', 'ivory']));
		expect(aiSearchOptions.types).toEqual(expect.arrayContaining(['russian manicure', 'japanese manicure', 'builder gel']));
		expect(aiSearchOptions.occasions).toEqual(expect.arrayContaining(['halloween', 'office', 'new year']));
		expect(aiSearchOptions.typesOfNails).toEqual(['both', 'manicure', 'pedicure']);
		expect(aiSearchOptions.seasons).toEqual(['autumn', 'spring', 'summer', 'winter']);
		expect(aiSearchOptions.shapes).toContain('mountain peak');
		expect(aiSearchOptions.lengths).toEqual(['long', 'short', 'medium']);
		expect(aiSearchOptions.finishes).toEqual(expect.arrayContaining(['cat-eye', 'holographic', 'jelly']));
		expect(aiSearchOptions.nailConcerns).toEqual(expect.arrayContaining(['bitten', 'split', 'thin']));
	});

	it('does not expose aliases as duplicate CMS options', () => {
		expect(aiSearchOptions.colors).not.toContain('baby blue');
		expect(aiSearchOptions.types).not.toContain('russian');
		expect(aiSearchOptions.occasions).not.toContain("new year's eve");
		expect(aiSearchOptions.seasons).not.toContain('fall');
		expect(aiSearchOptions.shapes).not.toContain('ballerina');
		expect(aiSearchOptions.finishes).not.toContain('metallic');
	});
});