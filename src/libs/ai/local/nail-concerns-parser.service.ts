import { DictionaryParser } from './dictionary-parser.service';

export class NailConcernsParser extends DictionaryParser {
    constructor() {
        super({
            'weak nails': 'weak',
            brittle: 'brittle',
            damaged: 'damaged',
            peeling: 'peeling',
            ridged: 'ridged',
            weak: 'weak',
            weakness: 'weak',
        });
    }
}