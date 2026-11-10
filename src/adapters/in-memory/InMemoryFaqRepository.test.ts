import { aFaq } from '../../test/faq-builder';
import { runFaqRepositoryContract } from '../contracts/faqRepository.contract';
import { InMemoryFaqRepository } from './InMemoryFaqRepository';

runFaqRepositoryContract(
	'InMemoryFaqRepository',
	() => new InMemoryFaqRepository([aFaq()]),
	() => new InMemoryFaqRepository([aFaq({ fullAnswer: '' })]),
);
