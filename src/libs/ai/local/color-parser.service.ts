import type { IParser } from './types';
import { aiSearchVocabulary } from '../vocabulary';

const negationPattern = /\b(?:avoid|no|not|without|do not|don't)\b/i;

export class ColorsParser implements IParser {
    private readonly colorPattern: RegExp;

    constructor() {
        const colorNames = Object.keys(aiSearchVocabulary.colors)
            .sort((left, right) => right.length - left.length)
            .map((color) => color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        this.colorPattern = new RegExp(`\\b(?:${colorNames.join('|')})\\b`, 'gi');
    }

    parse(text: string): string[] {
        const clauses = text.split(/[.,;!?]|\bbut\b|\bhowever\b/i);
        const colors = clauses
            .filter((clause) => !negationPattern.test(clause))
            .flatMap((clause) => [...clause.matchAll(this.colorPattern)]
                .map(([color]) => aiSearchVocabulary.colors[color.toLowerCase() as keyof typeof aiSearchVocabulary.colors]));

        return [...new Set(colors)];
    }
}