import type { SiteConfig } from '../../ports/SiteConfig';

export class InMemorySiteConfig implements SiteConfig {
	readonly siteUrl: string;
	readonly currentYear: number;

	constructor(siteUrl = 'https://nail.ai', currentYear = 2026) {
		this.siteUrl = siteUrl;
		this.currentYear = currentYear;
	}
}
