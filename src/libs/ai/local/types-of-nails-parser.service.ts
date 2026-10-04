import type { IParser } from './types';

export class TypesOfNailsParser implements IParser {
    parse(text: string): string[] {
        const hasManicure = /\b(?:manicures?|manis?)\b/i.test(text);
        const hasPedicure = /\b(?:pedicures?|pedis?)\b/i.test(text);

        if (hasManicure && hasPedicure) {
            return ['both'];
        }
        if (hasManicure) {
            return ['manicure'];
        }
        if (hasPedicure) {
            return ['pedicure'];
        }
        return [];
    }
}