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
			columns: ['typesOfNails', 'shape', 'title', 'length'],
			schema: {
				title: fields.slug({ name: { label: 'Name (shape-length-color-style)' } }),
				image: fields.image({
					label: 'Image',
					directory: 'src/assets/images/nails',
					publicPath: '/images/nails',
					validation: { isRequired: true },
				}),
				imageAlt: fields.text({ label: 'Image alt text', validation: { isRequired: true } }),
				description: fields.text({ label: 'Description', multiline: true }),
				typesOfNails: fields.select({
					label: 'Nail service',
					options: optionsFor(aiSearchOptions.typesOfNails),
					defaultValue: 'manicure',
				}),
				colors: fields.multiselect({ label: 'Colors', options: optionsFor(aiSearchOptions.colors), defaultValue: [] }),
				types: fields.multiselect({ label: 'Design styles', options: optionsFor(aiSearchOptions.types), defaultValue: [] }),
				occasions: fields.multiselect({ label: 'Occasions', options: optionsFor(aiSearchOptions.occasions), defaultValue: [] }),
				season: fields.multiselect({ label: 'Season', options: optionsFor(aiSearchOptions.seasons), defaultValue: [] }),
				shape: fields.select({ label: 'Nail shape', options: optionsFor(aiSearchOptions.shapes), defaultValue: 'almond' }),
				length: fields.select({ label: 'Nail length', options: optionsFor(aiSearchOptions.lengths), defaultValue: 'medium' }),
				finishes: fields.multiselect({ label: 'Finishes', options: optionsFor(aiSearchOptions.finishes), defaultValue: [] }),
				nailConcerns: fields.multiselect({ label: 'Nail concerns', options: optionsFor(aiSearchOptions.nailConcerns), defaultValue: [] }),
			},
		}),
		hubs: collection({
			label: 'SEO hubs',
			slugField: 'title',
			path: 'src/content/hubs/*',
			columns: ['area', 'urlSlug', 'title'],
			schema: {
				title: fields.slug({ name: { label: 'Editorial record name' } }),
				area: fields.select({
					label: 'Nail service',
					options: [{ label: 'Manicure', value: 'manicure' }, { label: 'Pedicure', value: 'pedicure' }],
					defaultValue: 'manicure',
				}),
				urlSlug: fields.text({ label: 'Generated hub slug', validation: { isRequired: true } }),
				intro: fields.text({ label: 'Unique introduction', multiline: true, validation: { isRequired: true } }),
				metaDescription: fields.text({ label: 'Meta description', validation: { isRequired: true } }),
				faq: fields.array(fields.object({
					question: fields.text({ label: 'Question', validation: { isRequired: true } }),
					answer: fields.text({ label: 'Answer', multiline: true, validation: { isRequired: true } }),
				}), { label: 'Hub FAQs', itemLabel: (props) => props.fields.question.value || 'FAQ item' }),
			},
		}),
	},
});