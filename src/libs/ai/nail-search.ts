import type { IAIResponse } from './types';

export interface NailRecord {
	slug: string;
	title: string;
	image: string;
	description: string;
	colors: readonly string[];
	types: readonly string[];
	occasions: readonly string[];
	typesOfNails: string;
	season?: string;
	shape?: string;
	length?: string;
	finishes: readonly string[];
	nailConcerns: readonly string[];
}

export interface NailSearchMatch {
	nail: NailRecord;
	score: number;
}

function listMatchScore(requested: readonly string[], available: readonly string[]): number | undefined {
	if (requested.length === 0) return undefined;
	const availableValues = new Set(available);
	return requested.filter((value) => availableValues.has(value)).length / requested.length;
}

export function searchNails(
	response: IAIResponse,
	nails: readonly NailRecord[],
): NailSearchMatch[] {
	return nails
		.map((nail) => {
			const requestedServices = response.typesOfNails === 'both'
				? ['both']
				: [response.typesOfNails];
			const availableServices = nail.typesOfNails === 'both'
				? ['manicure', 'pedicure', 'both']
				: [nail.typesOfNails];
			const scores = [listMatchScore(requestedServices, availableServices)];
			scores.push(listMatchScore(response.colors, nail.colors));
			scores.push(listMatchScore(response.types, nail.types));
			scores.push(listMatchScore(response.occasions ?? [], nail.occasions));
			scores.push(listMatchScore(response.season ? [response.season] : [], nail.season ? [nail.season] : []));
			scores.push(listMatchScore(response.shape ? [response.shape] : [], nail.shape ? [nail.shape] : []));
			scores.push(listMatchScore(response.length ? [response.length] : [], nail.length ? [nail.length] : []));
			scores.push(listMatchScore(response.finishes ?? [], nail.finishes));
			scores.push(listMatchScore(response.nailConcerns ?? [], nail.nailConcerns));

			const relevantScores = scores.filter((score): score is number => score !== undefined);
			const score = relevantScores.reduce((total, value) => total + value, 0) / relevantScores.length;
			return { nail, score };
		})
		.filter(({ score }) => score > 0)
		.sort((left, right) => right.score - left.score || left.nail.title.localeCompare(right.nail.title));
}