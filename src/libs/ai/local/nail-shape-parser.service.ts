import { DictionaryParser } from './dictionary-parser.service';
import { aiSearchVocabulary } from '../vocabulary';

export class NailShapeParser extends DictionaryParser {
    constructor() {
        super(aiSearchVocabulary.shapes);
    }
}