import { z } from 'zod';
import type { SiteConfig } from '../../ports/SiteConfig';

const siteConfigSchema = z.object({
	SITE_URL: z.url().default('https://nail.ai'),
});

interface SiteConfigEnvironment {
	SITE_URL?: string | undefined;
}

export class EnvSiteConfig implements SiteConfig {
	readonly siteUrl: string;

	constructor(environment: SiteConfigEnvironment = process.env) {
		const { SITE_URL } = siteConfigSchema.parse(environment);
		this.siteUrl = SITE_URL;
	}
}
