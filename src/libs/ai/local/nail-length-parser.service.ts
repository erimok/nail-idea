import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class NailLengthParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.lengths);
    }
}