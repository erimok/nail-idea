import { DictionaryParser } from './dictionary-parser.service';

export class SeasonParser extends DictionaryParser {
    constructor() {
        super({
            spring: 'spring',
            summer: 'summer',
            autumn: 'autumn',
            fall: 'autumn',
            winter: 'winter',
        });
    }
}