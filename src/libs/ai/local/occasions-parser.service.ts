import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class OccasionsParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.occasions);
    }
}