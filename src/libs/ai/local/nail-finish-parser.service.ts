import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class NailFinishParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.finishes);
    }
}