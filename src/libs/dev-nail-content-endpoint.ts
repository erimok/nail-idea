import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import { stringify } from 'yaml';
import { aiSearchOptions } from './ai/vocabulary';

const endpointPath = '/api/dev/nails';
const maxBodyBytes = 1024 * 1024;

const multiSelectOptions = {
	colors: aiSearchOptions.colors,
	types: aiSearchOptions.types,
	occasions: aiSearchOptions.occasions,
	season: aiSearchOptions.seasons,
	finishes: aiSearchOptions.finishes,
	nailConcerns: aiSearchOptions.nailConcerns,
} as const;

const singleSelectOptions = {
	typesOfNails: aiSearchOptions.typesOfNails,
	shape: aiSearchOptions.shapes,
	length: aiSearchOptions.lengths,
} as const;

const expectedFields = [
	'title', 'image', 'description', 'typesOfNails', 'colors', 'types', 'occasions',
	'season', 'shape', 'length', 'finishes', 'nailConcerns',
];

export type NailContentEntry = {
	title: string;
	image: string;
	description: string;
	typesOfNails: string;
	colors: string[];
	types: string[];
	occasions: string[];
	season: string[];
	shape: string;
	length: string;
	finishes: string[];
	nailConcerns: string[];
};

export function validateNailContent(value: unknown): { entry?: NailContentEntry; errors: string[] } {
	const errors: string[] = [];
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return { errors: ['Request body must be a JSON object.'] };
	}

	const input = value as Record<string, unknown>;
	for (const field of expectedFields) {
		if (!(field in input)) errors.push(`Missing required field: ${field}.`);
	}
	for (const field of Object.keys(input)) {
		if (!expectedFields.includes(field)) errors.push(`Unexpected field: ${field}.`);
	}

	for (const field of ['title', 'image', 'description'] as const) {
		if (typeof input[field] !== 'string' || input[field].trim() === '') {
			errors.push(`${field} must be a non-empty string.`);
		}
	}

	if (typeof input.image === 'string' && input.image.trim() !== '') {
		try {
			const imageUrl = new URL(input.image);
			if (imageUrl.protocol !== 'http:' && imageUrl.protocol !== 'https:') {
				errors.push('image must use http or https.');
			}
		} catch {
			errors.push('image must be a valid URL.');
		}
	}

	for (const [field, options] of Object.entries(singleSelectOptions)) {
		if (typeof input[field] !== 'string' || !options.includes(input[field])) {
			errors.push(`${field} must be one of: ${options.join(', ')}.`);
		}
	}

	for (const [field, options] of Object.entries(multiSelectOptions)) {
		const selected = input[field];
		if (!Array.isArray(selected) || selected.some((item) => typeof item !== 'string' || !options.includes(item))) {
			errors.push(`${field} must be an array of allowed canonical values.`);
		}
	}

	if (errors.length > 0) return { errors };
	return { entry: input as unknown as NailContentEntry, errors };
}

function slugifyTitle(title: string): string {
	return title
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function sendJson(response: import('node:http').ServerResponse, statusCode: number, body: unknown) {
	response.statusCode = statusCode;
	response.setHeader('Content-Type', 'application/json; charset=utf-8');
	response.end(JSON.stringify(body));
}

function isLocalRequest(request: import('node:http').IncomingMessage): boolean {
	const remoteAddress = request.socket.remoteAddress;
	if (remoteAddress !== '::1' && remoteAddress !== '127.0.0.1' && remoteAddress !== '::ffff:127.0.0.1') {
		return false;
	}

	const hostHeader = request.headers.host;
	if (!hostHeader) return false;
	try {
		const host = new URL(`http://${hostHeader}`).hostname;
		if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(host)) return false;
		const origin = request.headers.origin;
		return !origin || new URL(origin).host === hostHeader;
	} catch {
		return false;
	}
}

export function devNailContentEndpoint(): Plugin {
	return {
		name: 'dev-nail-content-endpoint',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(async (request, response, next) => {
				const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
				if (pathname !== endpointPath) return next();
				if (!isLocalRequest(request)) return sendJson(response, 403, { error: 'Local requests only.' });
				if (request.method !== 'POST') {
					response.setHeader('Allow', 'POST');
					return sendJson(response, 405, { error: 'Use POST with a JSON nail entry.' });
				}
				if (!request.headers['content-type']?.includes('application/json')) {
					return sendJson(response, 415, { error: 'Content-Type must be application/json.' });
				}

				try {
					const chunks: Buffer[] = [];
					let bodyBytes = 0;
					let bodyTooLarge = false;
					for await (const chunk of request) {
						const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
						bodyBytes += buffer.length;
						if (bodyBytes > maxBodyBytes) bodyTooLarge = true;
						if (!bodyTooLarge) chunks.push(buffer);
					}
					if (bodyTooLarge) return sendJson(response, 413, { error: 'Request body exceeds 1 MiB.' });

					let input: unknown;
					try {
						input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
					} catch {
						return sendJson(response, 400, { error: 'Request body must contain valid JSON.' });
					}

					const validation = validateNailContent(input);
					if (!validation.entry) return sendJson(response, 400, { errors: validation.errors });

					const slug = slugifyTitle(validation.entry.title);
					if (!slug) return sendJson(response, 400, { error: 'title must contain at least one English letter or number.' });

					const contentDirectory = path.join(process.cwd(), 'src/content/nails');
					const filePath = path.join(contentDirectory, `${slug}.yaml`);
					await mkdir(contentDirectory, { recursive: true });
					try {
						await writeFile(filePath, stringify(validation.entry), { encoding: 'utf8', flag: 'wx' });
					} catch (error) {
						if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
							return sendJson(response, 409, { error: `A nail entry named "${slug}" already exists.` });
						}
						throw error;
					}

					return sendJson(response, 201, { slug, file: `src/content/nails/${slug}.yaml` });
				} catch (error) {
					server.config.logger.error(`Failed to save nail entry: ${error instanceof Error ? error.message : String(error)}`);
					return sendJson(response, 500, { error: 'Failed to save nail entry.' });
				}
			});
		},
	};
}