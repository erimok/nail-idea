import type { aiSearchVocabulary } from './vocabulary';

type VocabularyValue<Dictionary> = Dictionary[keyof Dictionary];

export type AISeason = VocabularyValue<typeof aiSearchVocabulary.seasons>;
export type NailService = VocabularyValue<typeof aiSearchVocabulary.typesOfNails>;
export type NailShape = VocabularyValue<typeof aiSearchVocabulary.shapes>;
export type NailLength = VocabularyValue<typeof aiSearchVocabulary.lengths>;
export type NailFinish = VocabularyValue<typeof aiSearchVocabulary.finishes>;
export type NailConcern = VocabularyValue<typeof aiSearchVocabulary.nailConcerns>;

export interface IAIResponse {
    /** Colors explicitly requested or identified in the prompt. */
    colors: string[];
    /** Nail designs and application techniques, such as French, floral, Russian manicure, or Japanese manicure. */
    types: string[];
    /** Events or occasions associated with the requested nail design. */
    occasions?: string[];
    /** Season identified in the prompt; omitted when no season is specified. */
    season?: AISeason;
    /** Target nail service; defaults to manicure when the prompt does not specify one. */
    typesOfNails: NailService;
    /** Nail shape requested in the prompt; omitted when no shape is specified. */
    shape?: NailShape;
    /** Nail length requested in the prompt; omitted when no length is specified. */
    length?: NailLength;
    /** Surface finishes, such as chrome, glitter, glossy, matte, pearl, or shimmer. */
    finishes?: NailFinish[];
    /** Nail conditions or concerns mentioned in the prompt. */
    nailConcerns?: NailConcern[];
}

export interface IAIService {
    /** @throws {AIPasrseError} */
    parsePrompt(prompt: string): Promise<IAIResponse>;
}