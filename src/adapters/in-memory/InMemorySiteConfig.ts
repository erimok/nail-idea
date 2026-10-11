import type { SiteConfig } from '../../ports/SiteConfig';

export class InMemorySiteConfig implements SiteConfig {
	readonly siteUrl: string;

	constructor(siteUrl = 'https://nail.ai') {
		this.siteUrl = siteUrl;
	}
}
