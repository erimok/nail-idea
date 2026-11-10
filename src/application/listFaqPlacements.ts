import { getAllFacetPages } from '../domain/facet-combinations';
import { matchesFaqPlacement } from '../domain/faq';
import { buildFacetRoute } from '../domain/routes';
import type { FaqRepository } from '../ports/FaqRepository';
import type { NailRepository } from '../ports/NailRepository';

export async function listFaqPlacements({ faqRepository, nailRepository }: {
	faqRepository: FaqRepository;
	nailRepository: NailRepository;
}): Promise<readonly { slug: string; status: string; homepage: boolean; hubs: readonly string[] }[]> {
	const [faqs, nails] = await Promise.all([faqRepository.listFaqs(), nailRepository.findAllNails()]);
	const pages = getAllFacetPages(nails);
	return faqs.map((faq) => ({
		slug: faq.slug,
		status: faq.status,
		homepage: faq.homepage,
		hubs: pages.filter((page) => matchesFaqPlacement(faq, page))
			.map((page) => buildFacetRoute(page.area, page.slug)).sort(),
	})).sort((a, b) => a.slug.localeCompare(b.slug));
}
