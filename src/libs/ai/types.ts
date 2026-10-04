export interface IAIResponse {
    colors: string[];
    types: string[];
    occasions: string[];
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    typesOfNails: 'manicure' | 'pedicure' | 'both';
}

export interface IAIService {
    /** @throws {AIPasrseError} */
    parsePrompt(prompt: string): Promise<IAIResponse>;
}