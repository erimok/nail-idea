import type { HubRepository } from '../ports/HubRepository';
import type { FaqRepository } from '../ports/FaqRepository';
import type { NailRepository } from '../ports/NailRepository';
import type { SiteConfig } from '../ports/SiteConfig';
import type { SiteContentRepository } from '../ports/SiteContentRepository';

export interface ContentPorts {
	nailRepository: NailRepository;
	hubRepository: HubRepository;
}

export interface SitePorts extends ContentPorts {
	faqRepository: FaqRepository;
	siteContentRepository: SiteContentRepository;
	siteConfig: SiteConfig;
}
