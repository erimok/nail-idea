import type { IParser } from './types';

const colorNames = [
    'black',
    'blue',
    'brown',
    'coral',
    'gold',
    'green',
    'gray',
    'grey',
    'lavender',
    'maroon',
    'navy',
    'orange',
    'pink',
    'purple',
    'red',
    'silver',
    'teal',
    'white',
    'yellow',
];
const colorPattern = new RegExp(`\\b(?:${colorNames.join('|')})\\b`, 'gi');
const negationPattern = /\b(?:avoid|no|not|without|do not|don't)\b/i;

export class ColorsParser implements IParser {
    parse(text: string): string[] {
        const clauses = text.split(/[.,;!?]|\bbut\b|\bhowever\b/i);
        const colors = clauses
            .filter((clause) => !negationPattern.test(clause))
            .flatMap((clause) => [...clause.matchAll(colorPattern)].map(([color]) => color.toLowerCase()));

        return [...new Set(colors)];
    }
}