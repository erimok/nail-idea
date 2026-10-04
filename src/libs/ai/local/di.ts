import { AIService } from './ai.service';
import { ColorsParser } from './color-parser.service';
import { NailConcernsParser } from './nail-concerns-parser.service';
import { NailFinishParser } from './nail-finish-parser.service';
import { NailLengthParser } from './nail-length-parser.service';
import { NailShapeParser } from './nail-shape-parser.service';
import { OccasionsParser } from './occasions-parser.service';
import { SeasonParser } from './season-parser.service';
import { TypesOfNailsParser } from './types-of-nails-parser.service';
import { TypesParser } from './types-parser.service';

export default new AIService(
	new ColorsParser(),
	new TypesParser(),
	new OccasionsParser(),
	new SeasonParser(),
	new TypesOfNailsParser(),
	new NailShapeParser(),
	new NailLengthParser(),
	new NailFinishParser(),
	new NailConcernsParser(),
);