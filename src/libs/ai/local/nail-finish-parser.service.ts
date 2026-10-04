import { DictionaryParser } from './dictionary-parser.service';

export class NailFinishParser extends DictionaryParser {
    constructor() {
        super({
            'high-gloss': 'glossy',
            chrome: 'chrome',
            glitter: 'glitter',
            glossy: 'glossy',
            matte: 'matte',
            metallic: 'chrome',
            pearl: 'pearl',
            shimmer: 'shimmer',
            shiny: 'glossy',
        });
    }
}