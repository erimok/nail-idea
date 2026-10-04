import { DictionaryParser } from './dictionary-parser.service';

export class TypesParser extends DictionaryParser {
    constructor() {
        super({
            'french tip': 'french',
            abstract: 'abstract',
            chrome: 'chrome',
            floral: 'floral',
            french: 'french',
            glitter: 'glitter',
            marble: 'marble',
            ombre: 'ombre',
        });
    }
}