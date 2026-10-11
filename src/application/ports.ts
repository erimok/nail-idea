import type { HubRepository } from '../ports/HubRepository';
import type { NailRepository } from '../ports/NailRepository';
import type { SiteConfig } from '../ports/SiteConfig';
import type { SiteContentRepository } from '../ports/SiteContentRepository';

export interface ContentPorts {
	nailRepository: NailRepository;
	hubRepository: HubRepository;
}

export interface SitePorts extends ContentPorts {
	siteContentRepository: SiteContentRepository;
	siteConfig: SiteConfig;
}
