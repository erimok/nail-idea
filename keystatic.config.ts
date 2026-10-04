import { config, fields, collection } from '@keystatic/core';
import { aiSearchOptions } from './src/libs/ai/vocabulary';

const optionsFor = <Value extends string>(values: readonly Value[]) => values.map((value) => ({
	label: value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
	value,
}));

export default config({
	storage: {
		kind: 'local',
	},
	collections: {
		nails: collection({
			label: 'Nails',
			slugField: 'title',
			path: 'src/content/nails/*',
			columns: ['typesOfNails', 'season', 'shape'],
			schema: {
				title: fields.slug({ name: { label: 'Name' } }),
				image: fields.url({ label: 'Image URL', validation: { isRequired: true } }),
				description: fields.text({ label: 'Description', multiline: true }),
				typesOfNails: fields.select({
					label: 'Nail service',
					options: optionsFor(aiSearchOptions.typesOfNails),
					defaultValue: 'manicure',
				}),
				colors: fields.multiselect({ label: 'Colors', options: optionsFor(aiSearchOptions.colors), defaultValue: [] }),
				types: fields.multiselect({ label: 'Design styles', options: optionsFor(aiSearchOptions.types), defaultValue: [] }),
				occasions: fields.multiselect({ label: 'Occasions', options: optionsFor(aiSearchOptions.occasions), defaultValue: [] }),
				season: fields.select({ label: 'Season', options: optionsFor(aiSearchOptions.seasons), defaultValue: 'spring' }),
				shape: fields.select({ label: 'Nail shape', options: optionsFor(aiSearchOptions.shapes), defaultValue: 'almond' }),
				length: fields.select({ label: 'Nail length', options: optionsFor(aiSearchOptions.lengths), defaultValue: 'medium' }),
				finishes: fields.multiselect({ label: 'Finishes', options: optionsFor(aiSearchOptions.finishes), defaultValue: [] }),
				nailConcerns: fields.multiselect({ label: 'Nail concerns', options: optionsFor(aiSearchOptions.nailConcerns), defaultValue: [] }),
			},
		}),
		ideas: collection({
			label: 'Ideas',
			slugField: 'title',
			path: 'src/content/ideas/*',
			format: { contentField: 'content' },
			schema: {
				title: fields.slug({ name: { label: 'Title' } }),
				area: fields.select({
					label: 'Area',
					options: [
						{ label: 'Manicure', value: 'manicure' },
						{ label: 'Pedicure', value: 'pedicure' },
					],
					defaultValue: 'manicure',
				}),
				description: fields.text({ label: 'Description' }),
				content: fields.markdoc({ label: 'Content' }),
			},
		}),
	},
});