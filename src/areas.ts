export const nailAreas = ['manicure', 'pedicure'] as const;

export type NailArea = (typeof nailAreas)[number];

export function isNailArea(value: string): value is NailArea {
	return (nailAreas as readonly string[]).includes(value);
}