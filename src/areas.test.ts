import { describe, expect, it } from 'vitest';
import { isNailArea } from './areas';

describe('isNailArea', () => {
	it.each(['manicure', 'pedicure'])('accepts %s', (value) => {
		expect(isNailArea(value)).toBe(true);
	});

	it('rejects unknown areas', () => {
		expect(isNailArea('nail-art')).toBe(false);
	});
});