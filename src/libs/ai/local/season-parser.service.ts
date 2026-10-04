import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class SeasonParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.seasons);
    }
}