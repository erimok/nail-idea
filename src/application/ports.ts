import type { HubRepository } from '../ports/HubRepository';
import type { NailRepository } from '../ports/NailRepository';
import type { SiteConfig } from '../ports/SiteConfig';

export interface ContentPorts {
	nailRepository: NailRepository;
	hubRepository: HubRepository;
}

export interface SitePorts extends ContentPorts {
	siteConfig: SiteConfig;
}
