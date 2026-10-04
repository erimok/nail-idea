import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class TypesParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.types);
    }
}