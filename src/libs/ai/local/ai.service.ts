import { AIPasrseError, type IAIResponse, type IAIService } from '../index';
import type { IParser } from './types';

const seasons = ['spring', 'summer', 'autumn', 'winter'] as const;
const nailTypes = ['manicure', 'pedicure', 'both'] as const;

function isSeason(value: string | undefined): value is IAIResponse['season'] {
    return seasons.some((season) => season === value);
}

function isNailType(value: string | undefined): value is IAIResponse['typesOfNails'] {
    return nailTypes.some((nailType) => nailType === value);
}

export class AIService implements IAIService {
    constructor(
        private readonly colorParser: IParser,
        private readonly typeParser: IParser,
        private readonly occasionParser: IParser,
        private readonly seasonParser: IParser,
        private readonly typesOfNailsParser: IParser
    ) {}

    async parsePrompt(prompt: string): Promise<IAIResponse> {
        const season = this.seasonParser.parse(prompt)[0];
        if (!isSeason(season)) {
            throw new AIPasrseError('Could not determine a valid season');
        }

        const typesOfNails = this.typesOfNailsParser.parse(prompt)[0];
        if (!isNailType(typesOfNails)) {
            throw new AIPasrseError('Could not determine manicure or pedicure');
        }

        return {
            colors: this.colorParser.parse(prompt),
            types: this.typeParser.parse(prompt),
            occasions: this.occasionParser.parse(prompt),
            season,
            typesOfNails,
        };
    }
}