import type { FacetKind } from './facets/registry';

// One hand-written mood sentence per facet value. Values without an entry use the facet kind fallback.
export const facetMoods: Readonly<Record<string, string>> = {
	burgundy: 'Burgundy is the nail color for when you want depth without going black: rich in autumn, polished in the office, striking at night.',
	nude: 'Nude nails are the quiet luxury of manicures: soft, flattering on every skin tone and easy to wear from the office to the weekend.',
	blue: 'Blue brings calm and confidence to your hands, from soft sky shades for daytime to deep navy for evenings out.',
	silver: 'Silver nails catch the light with a cool, modern shine that dresses up a plain outfit and feels right for parties and everyday alike.',
	french: 'French nails are the timeless clean look: a neat white tip that stays polished, feels effortless and suits almost any occasion.',
	'micro french': 'Micro French keeps the classic tip but thins it to a delicate line, so your nails look fresh, refined and quietly detailed.',
};

export const facetKindMoods: Readonly<Record<FacetKind, (value: string) => string>> = {
	color: (value) => `${value} is a nail color with its own mood, easy to wear every day and bold enough to make your whole look feel intentional.`,
	type: (value) => `${value} nails are a style worth saving: a distinctive look that works on its own and pairs easily with the rest of your outfit.`,
	occasion: (value) => `Planning ${value.toLowerCase()} nails? These ideas help your manicure fit the moment, whether you want it subtle, festive or memorable.`,
	season: (value) => `${value} nails follow the mood of the season, with colors and finishes that feel right for the weather and your wardrobe.`,
	shape: (value) => `The ${value.toLowerCase()} shape changes how your hands look and feel, balancing comfort, elegance and the way your favorite colors wear.`,
	length: (value) => `${value} nails set the tone for the whole manicure, shaping how practical, graceful or dramatic your favorite designs feel.`,
	finishing: (value) => `A ${value.toLowerCase()} finish changes how a color reads in the light, turning a simple shade into something with texture and personality.`,
};
