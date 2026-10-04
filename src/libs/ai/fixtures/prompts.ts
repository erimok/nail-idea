import type { IAIResponse } from '../types';

export interface PromptFixture {
	name: string;
	prompt: string;
	expected: IAIResponse;
}

export const prompts: PromptFixture[] = [
	{
		name: 'single values for a spring wedding manicure',
		prompt: 'A red French manicure for a spring wedding.',
		expected: {
			colors: ['red'],
			types: ['french'],
			occasions: ['wedding'],
			season: 'spring',
			typesOfNails: 'manicure',
		},
	},
	{
		name: 'multiple values for a summer beach manicure',
		prompt: 'For summer, create a manicure with coral and white ombre nails for a beach vacation.',
		expected: {
			colors: ['coral', 'white'],
			types: ['ombre'],
			occasions: ['beach vacation'],
			season: 'summer',
			typesOfNails: 'manicure',
		},
	},
	{
		name: 'matching manicure and pedicure with multiple occasions',
		prompt: 'For autumn, create matching manicure and pedicure with red, gold, and black floral nails for a wedding and birthday.',
		expected: {
			colors: ['red', 'gold', 'black'],
			types: ['floral'],
			occasions: ['wedding', 'birthday'],
			season: 'autumn',
			typesOfNails: 'both',
		},
	},
	{
		name: 'a winter Christmas pedicure',
		prompt: 'Suggest a lavender glitter pedicure for Christmas in winter.',
		expected: {
			colors: ['lavender'],
			types: ['glitter'],
			occasions: ['christmas'],
			season: 'winter',
			typesOfNails: 'pedicure',
		},
	},
	{
		name: 'empty color, style, and occasion lists',
		prompt: 'Suggest a manicure for spring.',
		expected: {
			colors: [],
			types: [],
			occasions: [],
			season: 'spring',
			typesOfNails: 'manicure',
		},
	},
	{
		name: 'case-insensitive colors without duplicates',
		prompt: 'Use RED and red with blue details for a summer pedicure.',
		expected: {
			colors: ['red', 'blue'],
			types: [],
			occasions: [],
			season: 'summer',
			typesOfNails: 'pedicure',
		},
	},
	{
		name: 'a negated color',
		prompt: 'Avoid red polish; use blue for a winter manicure instead.',
		expected: {
			colors: ['blue'],
			types: [],
			occasions: [],
			season: 'winter',
			typesOfNails: 'manicure',
		},
	},
];