import { DictionaryParser } from './dictionary-parser.service';

export class TypesParser extends DictionaryParser {
    constructor() {
        super({
            'french tip': 'french',
            abstract: 'abstract',
            floral: 'floral',
            french: 'french',
            marble: 'marble',
            ombre: 'ombre',
        });
    }
}