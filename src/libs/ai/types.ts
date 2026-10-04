export interface IAIResponse {
    /** Colors explicitly requested or identified in the prompt. */
    colors: string[];
    /** Nail design styles, such as French, floral, or ombre. */
    types: string[];
    /** Events or occasions associated with the requested nail design. */
    occasions?: string[];
    /** Season identified in the prompt; omitted when no season is specified. */
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    /** Target nail service; defaults to manicure when the prompt does not specify one. */
    typesOfNails: 'manicure' | 'pedicure' | 'both';
    /** Nail shape requested in the prompt; omitted when no shape is specified. */
    shape?: 'almond' | 'coffin' | 'oval' | 'round' | 'squoval' | 'square' | 'stiletto';
    /** Nail length requested in the prompt; omitted when no length is specified. */
    length?: 'short' | 'medium' | 'long';
    /** Surface finishes, such as chrome, glitter, glossy, matte, pearl, or shimmer. */
    finishes?: ('chrome' | 'glitter' | 'glossy' | 'matte' | 'pearl' | 'shimmer')[];
    /** Nail conditions or concerns mentioned in the prompt. */
    nailConcerns?: ('weak' | 'brittle' | 'peeling' | 'ridged' | 'damaged')[];
}

export interface IAIService {
    /** @throws {AIPasrseError} */
    parsePrompt(prompt: string): Promise<IAIResponse>;
}