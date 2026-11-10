import type { FaqRepository } from '../ports/FaqRepository';
import { publishedFaqs } from './faq-support';

export async function listFaqRoutes(faqRepository: FaqRepository): Promise<readonly { slug: string }[]> {
	return publishedFaqs(await faqRepository.listFaqs()).map(({ slug }) => ({ slug }));
}
