import { DictionaryParser } from './dictionary-parser.service';

export class NailShapeParser extends DictionaryParser {
    constructor() {
        super({
            almond: 'almond',
            ballerina: 'coffin',
            coffin: 'coffin',
            oval: 'oval',
            round: 'round',
            squoval: 'squoval',
            square: 'square',
            stiletto: 'stiletto',
        });
    }
}