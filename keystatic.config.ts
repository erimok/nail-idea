import { config, fields, collection } from '@keystatic/core';

export default config({
	storage: {
		kind: 'local',
	},
	collections: {
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