import type { NailRecord } from './ai/nail-search';
import { formatFacetLabel, type NailFacetPage } from './seo-pages';
import { isIndexable } from './hub-index';

export const homepageFaq = [
	{
		question: 'How do I choose the right nail shape?',
		answer: 'Start with your preferred nail length and daily routine. Square and squoval are common choices for short nails; round and oval follow a softer curve, while almond tapers toward the tip. The best fit depends on your natural nails and preference, so ask your nail tech to recommend a shape before filing.',
	},
	{
		question: 'What is a micro French manicure?',
		answer: 'A micro French is a French manicure with a much thinner tip line than the classic version. It looks subtle and modern, and works well on short nails with nude, milky, or deeper shades like burgundy.',
	},
	{
		question: 'Which nail colors work for the office or an interview?',
		answer: 'Soft nudes, milky pinks, sheer neutrals, and classic French tips are understated options for many offices and interviews. A glossy finish can keep the look polished; dress codes and personal preference vary.',
	},
	{
		question: 'How long does a manicure or pedicure last?',
		answer: 'Wear depends on the polish, application, nail growth, and daily activity. Regular polish may chip within about a week; gel manicures often last around two to three weeks. Pedicure polish can last longer because toenails grow more slowly and usually get less daily wear. Follow your nail tech’s care and removal advice.',
	},
	{
		question: 'What’s the difference between manicure and pedicure ideas?',
		answer: 'Manicures are for your hands and pedicures are for your feet. Pedicures can be a place to try brighter shades, while manicure ideas often focus on everyday or work settings. Designs such as French tips and solid colors can work for either.',
	},
	{
		question: 'How does the Nail.ai idea finder work?',
		answer: 'Type a short description of the nails you imagine. The idea finder parses details it recognizes, such as color, shape, length, finish, and occasion, then ranks designs in the collection and shows up to three close matches. Add details or try a different description to refine the results.',
	},
] as const;

const categoryDefinitions: { title: string; description: string; matches: (page: NailFacetPage) => boolean }[] = [
	{ title: 'Nail shapes', description: 'Almond, square, round, oval, coffin, and more. Pick a shape that suits your nail length and daily routine.', matches: (page) => page.kind === 'shape' },
	{ title: 'Nail colors', description: 'From soft nudes and milky pinks to burgundy, red, and chrome. Find shades to suit your wardrobe and personal style.', matches: (page) => page.kind === 'color' },
	{ title: 'Designs by occasion', description: 'Wedding, office, date night, vacation, birthday, and holiday nails, chosen to fit the moment.', matches: (page) => page.kind === 'occasion' },
	{ title: 'Seasonal nails', description: 'Fresh spring pastels, summer brights, deep autumn tones, and winter classics.', matches: (page) => page.kind === 'season' },
	{ title: 'French and micro French', description: 'Classic white tips, thin micro French lines, and colored variations that stay polished and wearable.', matches: (page) => page.kind === 'type' && /french/i.test(page.value) },
	{ title: 'Short nails', description: 'Neat, low-maintenance ideas for short nails that still look intentional.', matches: (page) => page.kind === 'length' && page.value.toLowerCase() === 'short' },
];

export function getHomepageCategories(pages: readonly NailFacetPage[]) {
	return categoryDefinitions.map((category) => ({
		...category,
		pages: pages.filter((page) => isIndexable(page) && category.matches(page)).slice(0, 4),
	})).filter((category) => category.pages.length > 0).map((category) => ({
		...category,
		thumbnail: category.pages[0].nails[0],
		links: category.pages.map((page) => ({
			label: formatFacetLabel(page),
			href: `/${page.area}/${page.slug}/`,
		})),
	}));
}

export function getHomepageFeatured(nails: readonly NailRecord[]): NailRecord[] {
	return nails.slice(0, 9);
}