import type { NailArea } from './domain/areas';
import type { NailRecord } from './domain/nail';
import type { HubEditorial } from './domain/hub-types';
import { EnvSiteConfig } from './adapters/config/EnvSiteConfig';
import { KeystaticHubRepository } from './adapters/keystatic/KeystaticHubRepository';
import { KeystaticNailRepository } from './adapters/keystatic/KeystaticNailRepository';
import { buildAboutPage } from './application/buildAboutPage';
import { buildAreaPage } from './application/buildAreaPage';
import { buildHomepage } from './application/buildHomepage';
import { buildHubPage } from './application/buildHubPage';
import { listHubRoutes } from './application/listHubRoutes';
import { resolveBrowseLinks } from './application/resolveBrowseLinks';
import { resolveSitemapRoutes } from './application/resolveSitemapRoutes';
import type { HubRepository } from './ports/HubRepository';
import type { NailRepository } from './ports/NailRepository';

function belongsToArea(nail: NailRecord, area: NailArea): boolean {
	return nail.typesOfNails === area || nail.typesOfNails === 'both';
}

function createCachedNailRepository(repository: NailRepository): NailRepository {
	let allNailsPromise: Promise<readonly NailRecord[]> | undefined;

	async function loadAllNails(): Promise<readonly NailRecord[]> {
		allNailsPromise ??= repository.findAllNails();
		return allNailsPromise;
	}

	return {
		async findAllNails(): Promise<readonly NailRecord[]> {
			return [...await loadAllNails()];
		},
		async findNailsByArea(area: NailArea): Promise<readonly NailRecord[]> {
			return (await loadAllNails()).filter((nail) => belongsToArea(nail, area));
		},
	};
}

function createCachedHubRepository(repository: HubRepository): HubRepository {
	let hubsPromise: Promise<readonly HubEditorial[]> | undefined;

	async function loadHubs(): Promise<readonly HubEditorial[]> {
		hubsPromise ??= repository.listHubs();
		return hubsPromise;
	}

	return {
		async listHubs(): Promise<readonly HubEditorial[]> {
			return [...await loadHubs()];
		},
		async getHub(area: NailArea, slug: string): Promise<HubEditorial | null> {
			return (await loadHubs()).find((hub) => hub.area === area && hub.urlSlug === slug) ?? null;
		},
	};
}

const nailRepository = createCachedNailRepository(new KeystaticNailRepository());
const hubRepository = createCachedHubRepository(new KeystaticHubRepository());
const siteConfig = new EnvSiteConfig(process.env);
const ports = { nailRepository, hubRepository, siteConfig };
export const siteUrl = siteConfig.siteUrl;

export const siteServices = {
	buildAboutPage: () => buildAboutPage(ports),
	buildAreaPage: (params: Parameters<typeof buildAreaPage>[1]) => buildAreaPage(ports, params),
	buildHomepage: () => buildHomepage(ports),
	buildHubPage: (params: Parameters<typeof buildHubPage>[1]) => buildHubPage(ports, params),
	listHubRoutes: () => listHubRoutes(ports),
	resolveBrowseLinks,
	resolveSitemapRoutes: () => resolveSitemapRoutes(ports),
};
