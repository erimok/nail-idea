import type { NailArea } from './areas';

export type SeasonValue = readonly string[] | string | undefined;

export type NailService = NailArea | 'both';

export interface NailRecord {
	slug: string;
	title: string;
	createdAt?: string;
	updatedAt?: string;
	image: string;
	imageSrc?: string;
	imageAlt?: string;
	description: string;
	colors: readonly string[];
	types: readonly string[];
	occasions: readonly string[];
	typesOfNails: NailService;
	season?: SeasonValue;
	shape?: string;
	length?: string;
	finishes: readonly string[];
	nailConcerns: readonly string[];
}

export type NailSearchRecord = Omit<NailRecord, 'image'>;
