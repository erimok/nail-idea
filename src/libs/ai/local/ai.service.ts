import type { IAIResponse, IAIService } from '../index';
import type { IParser } from './types';

const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
const nailTypes = ['manicure', 'pedicure', 'both'] as const;
const nailShapes = ['almond', 'coffin', 'oval', 'round', 'squoval', 'square', 'stiletto'] as const;
const nailLengths = ['short', 'medium', 'long'] as const;
const nailFinishes = ['chrome', 'glitter', 'glossy', 'matte', 'pearl', 'shimmer'] as const;
const nailConcerns = ['weak', 'brittle', 'peeling', 'ridged', 'damaged'] as const;

function isSeason(value: string | undefined): value is Exclude<IAIResponse['season'], undefined> {
    return seasons.some((season) => season === value);
}

function isNailType(value: string | undefined): value is IAIResponse['typesOfNails'] {
    return nailTypes.some((nailType) => nailType === value);
}

function isNailShape(value: string | undefined): value is NonNullable<IAIResponse['shape']> {
    return nailShapes.some((shape) => shape === value);
}

function isNailLength(value: string | undefined): value is NonNullable<IAIResponse['length']> {
    return nailLengths.some((length) => length === value);
}

function isNailFinish(value: string): value is (typeof nailFinishes)[number] {
    return nailFinishes.some((finish) => finish === value);
}

function isNailConcern(value: string): value is (typeof nailConcerns)[number] {
    return nailConcerns.some((concern) => concern === value);
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