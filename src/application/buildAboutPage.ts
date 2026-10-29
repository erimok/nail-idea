import type { SitePorts } from './ports';
import { buildStaticPage } from './buildStaticPage';

export function buildAboutPage(ports: SitePorts) {
	return buildStaticPage(ports, {
		title: 'About nail-idea.com | Nail Design Inspiration',
		description: 'Learn about nail-idea.com, a searchable collection of manicure and pedicure ideas organized around the details you care about.',
		pathname: '/about/',
	});
}
