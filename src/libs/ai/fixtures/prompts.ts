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
			finishes: [],
			nailConcerns: [],
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
			finishes: [],
			nailConcerns: [],
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
			finishes: [],
			nailConcerns: [],
		},
	},
	{
		name: 'a winter Christmas pedicure',
		prompt: 'Suggest a lavender glitter pedicure for Christmas in winter.',
		expected: {
			colors: ['lavender'],
			types: [],
			occasions: ['christmas'],
			season: 'winter',
			typesOfNails: 'pedicure',
			finishes: ['glitter'],
			nailConcerns: [],
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
			finishes: [],
			nailConcerns: [],
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
			finishes: [],
			nailConcerns: [],
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
			finishes: [],
			nailConcerns: [],
		},
	},
	{
		name: 'shape, length, finish, and nail concerns',
		prompt: 'A short almond manicure with a glossy finish for spring, suitable for weak and brittle nails.',
		expected: {
			colors: [],
			types: [],
			occasions: [],
			season: 'spring',
			typesOfNails: 'manicure',
			shape: 'almond',
			length: 'short',
			finishes: ['glossy'],
			nailConcerns: ['weak', 'brittle'],
		},
	},
	{
		name: 'multiple finishes and nail concerns',
		prompt: 'For summer, create a long square manicure with chrome and shimmer finishes; help with peeling and ridged nails.',
		expected: {
			colors: [],
			types: [],
			occasions: [],
			typesOfNails: 'manicure',
			season: 'summer',
			shape: 'square',
			length: 'long',
			finishes: ['chrome', 'shimmer'],
			nailConcerns: ['peeling', 'ridged'],
		},
	},
];