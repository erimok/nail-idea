import { DictionaryParser } from './dictionary-parser.service';

export class OccasionsParser extends DictionaryParser {
    constructor() {
        super({
            'beach vacation': 'beach vacation',
            'baby shower': 'baby shower',
            birthday: 'birthday',
            christmas: 'christmas',
            graduation: 'graduation',
            holiday: 'holiday',
            prom: 'prom',
            wedding: 'wedding',
        });
    }
}