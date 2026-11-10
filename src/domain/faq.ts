import type { NailArea } from './areas';
import type { NailFacetPage, NailFacetSelection } from './facet-combinations';
import { isNailArea } from './areas';
import type { FacetKind } from './facets/registry';

export interface FaqRecord {
	slug: string;
	question: string;
	summary: string;
	fullAnswer: string;
	metaDescription: string;
	status: 'draft' | 'published';
	areas: readonly NailArea[];
	facets: readonly NailFacetSelection[];
	hubs: readonly { area: NailArea; slug: string }[];
	homepage: boolean;
	order: number;
	updatedAt?: string;
}

export function isPublishedFaq(faq: FaqRecord): boolean {
	return faq.status === 'published';
}

export function validateFaq(faq: FaqRecord, isKnownFacet: (kind: FacetKind, value: string) => boolean): void {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(faq.slug)) throw new Error(`Invalid FAQ slug: ${faq.slug}`);
	if (faq.status !== 'draft' && faq.status !== 'published') throw new Error(`Invalid status in FAQ "${faq.slug}".`);
	if (!Number.isInteger(faq.order)) throw new Error(`Invalid order in FAQ "${faq.slug}".`);
	if (faq.status === 'published' && [faq.question, faq.summary, faq.fullAnswer, faq.metaDescription].some((value) => !value.trim())) {
		throw new Error(`Published FAQ "${faq.slug}" requires a question, summary, full answer and meta description.`);
	}
	if (faq.status === 'published' && faq.summary.trim() === faq.fullAnswer.trim()) {
		throw new Error(`Published FAQ "${faq.slug}" requires a full answer distinct from its summary.`);
	}
	if (faq.status === 'published' && faq.facets.length > 0 && faq.areas.length === 0) {
		throw new Error(`FAQ "${faq.slug}" has facet assignments but no areas.`);
	}
	if (faq.areas.some((area) => !isNailArea(area))) throw new Error(`Invalid area in FAQ "${faq.slug}".`);
	if (new Set(faq.areas).size !== faq.areas.length) throw new Error(`Duplicate area in FAQ "${faq.slug}".`);
	if (faq.facets.some(({ kind, value }) => !isKnownFacet(kind, value))) throw new Error(`Invalid facet in FAQ "${faq.slug}".`);
	if (new Set(faq.facets.map(({ kind, value }) => `${kind}/${value}`)).size !== faq.facets.length) throw new Error(`Duplicate facet in FAQ "${faq.slug}".`);
	if (new Set(faq.hubs.map((hub) => `${hub.area}/${hub.slug}`)).size !== faq.hubs.length) throw new Error(`Duplicate hub in FAQ "${faq.slug}".`);
	if (faq.hubs.some((hub) => !isNailArea(hub.area) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(hub.slug))) throw new Error(`Invalid hub in FAQ "${faq.slug}".`);
	if (faq.updatedAt && Number.isNaN(Date.parse(faq.updatedAt))) throw new Error(`Invalid timestamp in FAQ "${faq.slug}".`);
}

export function matchesFaqHub(
	faq: FaqRecord,
	page: Pick<NailFacetPage, 'area' | 'slug' | 'facets'>,
): boolean {
	return isPublishedFaq(faq) && matchesFaqPlacement(faq, page);
}

export function matchesFaqPlacement(
	faq: FaqRecord,
	page: Pick<NailFacetPage, 'area' | 'slug' | 'facets'>,
): boolean {
	return (
		faq.hubs.some((hub) => hub.area === page.area && hub.slug === page.slug)
		|| (faq.areas.includes(page.area)
			&& faq.facets.some((assignment) => page.facets.some((facet) =>
				assignment.kind === facet.kind && assignment.value === facet.value)))
	);
}
