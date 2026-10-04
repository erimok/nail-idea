import type { IParser } from './types';

export class DictionaryParser implements IParser {
    private readonly pattern: RegExp;

    constructor(private readonly dictionary: Readonly<Record<string, string>>) {
        const terms = Object.keys(dictionary)
            .sort((left, right) => right.length - left.length)
            .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        this.pattern = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
    }

    parse(text: string): string[] {
        const matches = [...text.matchAll(this.pattern)]
            .map(([term]) => this.dictionary[term.toLowerCase()]);

        return [...new Set(matches)];
    }
}