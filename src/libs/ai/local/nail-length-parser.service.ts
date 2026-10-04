import { DictionaryParser } from './dictionary-parser.service';

export class NailLengthParser extends DictionaryParser {
    constructor() {
        super({
            'extra long': 'long',
            'extra short': 'short',
            'medium-length': 'medium',
            long: 'long',
            medium: 'medium',
            short: 'short',
        });
    }
}