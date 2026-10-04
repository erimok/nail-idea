import type { IAIResponse, IAIService } from '../index';
import { aiSearchVocabulary } from '../vocabulary';
import type { IParser } from './types';

function isSeason(value: string | undefined): value is Exclude<IAIResponse['season'], undefined> {
    return value !== undefined && Object.values(aiSearchVocabulary.seasons).some((season) => season === value);
}

function isNailType(value: string | undefined): value is IAIResponse['typesOfNails'] {
    return value !== undefined && Object.values(aiSearchVocabulary.typesOfNails).some((nailType) => nailType === value);
}

function isNailShape(value: string | undefined): value is NonNullable<IAIResponse['shape']> {
    return value !== undefined && Object.values(aiSearchVocabulary.shapes).some((shape) => shape === value);
}

function isNailLength(value: string | undefined): value is NonNullable<IAIResponse['length']> {
    return value !== undefined && Object.values(aiSearchVocabulary.lengths).some((length) => length === value);
}

function isNailFinish(value: string): value is NonNullable<IAIResponse['finishes']>[number] {
    return Object.values(aiSearchVocabulary.finishes).some((finish) => finish === value);
}

function isNailConcern(value: string): value is NonNullable<IAIResponse['nailConcerns']>[number] {
    return Object.values(aiSearchVocabulary.nailConcerns).some((concern) => concern === value);
}

export class AIService implements IAIService {
    constructor(
        private readonly colorParser: IParser,
        private readonly typeParser: IParser,
        private readonly occasionParser: IParser,
        private readonly seasonParser: IParser,
        private readonly typesOfNailsParser: IParser,
        private readonly nailShapeParser: IParser,
        private readonly nailLengthParser: IParser,
        private readonly nailFinishParser: IParser,
        private readonly nailConcernsParser: IParser
    ) {}

    async parsePrompt(prompt: string): Promise<IAIResponse> {
        const parsedSeason = this.seasonParser.parse(prompt)[0];
        const season = isSeason(parsedSeason) ? parsedSeason : undefined;
        const parsedTypesOfNails = this.typesOfNailsParser.parse(prompt)[0];
        const typesOfNails = isNailType(parsedTypesOfNails) ? parsedTypesOfNails : 'manicure';
        const parsedShape = this.nailShapeParser.parse(prompt)[0];
        const shape = isNailShape(parsedShape) ? parsedShape : undefined;
        const parsedLength = this.nailLengthParser.parse(prompt)[0];
        const length = isNailLength(parsedLength) ? parsedLength : undefined;

        return {
            colors: this.colorParser.parse(prompt),
            types: this.typeParser.parse(prompt),
            occasions: this.occasionParser.parse(prompt),
            ...(season === undefined ? {} : { season }),
            typesOfNails,
            ...(shape === undefined ? {} : { shape }),
            ...(length === undefined ? {} : { length }),
            finishes: this.nailFinishParser.parse(prompt).filter(isNailFinish),
            nailConcerns: this.nailConcernsParser.parse(prompt).filter(isNailConcern),
        };
    }
}