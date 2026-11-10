import { fileURLToPath } from 'node:url';
import { runFaqRepositoryContract } from '../contracts/faqRepository.contract';
import { KeystaticFaqRepository } from './KeystaticFaqRepository';

const rootPath = fileURLToPath(new URL('./fixtures/content', import.meta.url));
const invalidRootPath = fileURLToPath(new URL('./fixtures/invalid-faq', import.meta.url));

runFaqRepositoryContract(
	'KeystaticFaqRepository',
	() => new KeystaticFaqRepository({ rootPath }),
	() => new KeystaticFaqRepository({ rootPath: invalidRootPath }),
);
