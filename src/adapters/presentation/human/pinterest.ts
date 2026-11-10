export interface PinterestInput {
	canonical: string;
	image: string;
	description: string;
}

export function buildPinterestUrl({ canonical, image, description }: PinterestInput): string {
	const url = new URL('https://www.pinterest.com/pin/create/button/');
	url.searchParams.set('url', canonical);
	url.searchParams.set('media', new URL(image, canonical).href);
	url.searchParams.set('description', description);
	return url.href.replace(/\+/g, '%20');
}
