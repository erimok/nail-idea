import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class NailConcernsParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.nailConcerns);
    }
}