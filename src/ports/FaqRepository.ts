import type { FaqRecord } from '../domain/faq';

export interface FaqRepository {
	listFaqs(): Promise<readonly FaqRecord[]>;
}
