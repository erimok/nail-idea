import { config, fields, collection } from '@keystatic/core';
import { aiSearchOptions } from './src/libs/ai/vocabulary';
import { faqFacetOptions } from './src/libs/ai/faq-facet-options';
import { nailAreas } from './src/domain/areas';

const optionsFor = <Value extends string>(values: readonly Value[]) => values.map((value) => ({
	label: value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
	value,
}));

export default config({
	storage: {
		kind: 'local',
	},
	collections: {
		sharedFaqs: collection({
			label: 'Reusable FAQs',
			slugField: 'question',
			path: 'src/content/shared-faqs/*',
			columns: ['question', 'status', 'order'],
			schema: {
				question: fields.slug({
					name: { label: 'Question' },
					slug: { label: 'Public slug', description: 'Do not change after publication without an approved redirect.' },
				}),
				status: fields.select({
					label: 'Status',
					options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
					defaultValue: 'draft',
				}),
				summary: fields.text({ label: 'Short answer', multiline: true }),
				fullAnswer: fields.text({ label: 'Full answer', multiline: true }),
				metaDescription: fields.text({ label: 'Meta description' }),
				homepage: fields.checkbox({ label: 'Feature on homepage', defaultValue: false }),
				order: fields.integer({ label: 'Display order', defaultValue: 1 }),
				areas: fields.multiselect({ label: 'Areas for inherited facets', options: optionsFor(nailAreas), defaultValue: [] }),
				colors: fields.multiselect({ label: 'Colors', options: optionsFor(faqFacetOptions.colors.values), defaultValue: [] }),
				types: fields.multiselect({ label: 'Design styles', options: optionsFor(faqFacetOptions.types.values), defaultValue: [] }),
				occasions: fields.multiselect({ label: 'Occasions', options: optionsFor(faqFacetOptions.occasions.values), defaultValue: [] }),
				seasons: fields.multiselect({ label: 'Seasons', options: optionsFor(faqFacetOptions.seasons.values), defaultValue: [] }),
				shapes: fields.multiselect({ label: 'Shapes', options: optionsFor(faqFacetOptions.shapes.values), defaultValue: [] }),
				lengths: fields.multiselect({ label: 'Lengths', options: optionsFor(faqFacetOptions.lengths.values), defaultValue: [] }),
				finishes: fields.multiselect({ label: 'Finishes', options: optionsFor(faqFacetOptions.finishes.values), defaultValue: [] }),
				hubs: fields.array(fields.object({
					area: fields.select({ label: 'Area', options: optionsFor(nailAreas), defaultValue: 'manicure' }),
					slug: fields.text({ label: 'Exact hub slug', validation: { isRequired: true } }),
				}), { label: 'Additional exact hub placements', itemLabel: (props) => props.fields.slug.value || 'Hub' }),
				updated_at: fields.datetime({ label: 'Last content update' }),
			},
		}),
		faqs: collection({
			label: 'Homepage FAQs',
			slugField: 'question',
			path: 'src/content/faqs/*',
			columns: ['order', 'question'],
			schema: {
				question: fields.slug({ name: { label: 'Question' } }),
				order: fields.integer({ label: 'Display order', defaultValue: 1 }),
				answer: fields.text({ label: 'Answer', multiline: true, validation: { isRequired: true } }),
			},
		}),
		navigation: collection({
			label: 'Navigation menus',
			slugField: 'title',
			path: 'src/content/navigation/*',
			columns: ['order', 'title', 'placement'],
			schema: {
				title: fields.slug({ name: { label: 'Menu group name' } }),
				order: fields.integer({ label: 'Display order', defaultValue: 1 }),
				placement: fields.select({
					label: 'Show in',
					options: [
						{ label: 'Header browse menu', value: 'header' },
						{ label: 'Footer', value: 'footer' },
						{ label: 'Header and footer', value: 'both' },
					],
					defaultValue: 'both',
				}),
				links: fields.array(fields.object({
					label: fields.text({ label: 'Link label', validation: { isRequired: true } }),
					href: fields.text({ label: 'Hub URL', validation: { isRequired: true } }),
				}), { label: 'Links', itemLabel: (props) => props.fields.label.value || 'Menu link' }),
			},
		}),
		nails: collection({
			label: 'Nails',
			slugField: 'title',
			path: 'src/content/nails/*',
			columns: ['typesOfNails', 'shape', 'title', 'length', 'created_at', 'updated_at'],
			schema: {
				title: fields.slug({ name: { label: 'Name (shape-length-color-style)' } }),
				created_at: fields.datetime({ label: 'Created at', defaultValue: { kind: 'now' } }),
				updated_at: fields.datetime({ label: 'Last updated at', defaultValue: { kind: 'now' } }),
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
			columns: ['area', 'urlSlug', 'title', 'updated_at'],
			schema: {
				title: fields.slug({ name: { label: 'Editorial record name' } }),
				updated_at: fields.datetime({ label: 'Last updated at', defaultValue: { kind: 'now' } }),
				area: fields.select({
					label: 'Nail service',
					options: [{ label: 'Manicure', value: 'manicure' }, { label: 'Pedicure', value: 'pedicure' }],
					defaultValue: 'manicure',
				}),
				urlSlug: fields.text({ label: 'Generated hub slug', validation: { isRequired: true } }),
				intro: fields.text({ label: 'Unique introduction', multiline: true, validation: { isRequired: true } }),
				metaDescription: fields.text({ label: 'Meta description', validation: { isRequired: true } }),
				sections: fields.array(fields.object({
					heading: fields.text({ label: 'Section heading', validation: { isRequired: true } }),
					body: fields.text({ label: 'Section copy', multiline: true, validation: { isRequired: true } }),
				}), { label: 'Editorial sections', itemLabel: (props) => props.fields.heading.value || 'Editorial section' }),
				faq: fields.array(fields.object({
					question: fields.text({ label: 'Question', validation: { isRequired: true } }),
					answer: fields.text({ label: 'Answer', multiline: true, validation: { isRequired: true } }),
				}), { label: 'Hub FAQs', itemLabel: (props) => props.fields.question.value || 'FAQ item' }),
			},
		}),
	},
});