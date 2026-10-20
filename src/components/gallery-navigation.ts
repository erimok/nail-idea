/** Moves an index by `delta`, wrapping around both ends. Returns 0 for an empty list. */
export function stepIndex(index: number, delta: number, length: number): number {
	if (length <= 0) return 0;
	return (((index + delta) % length) + length) % length;
}
