const badgeUrl = 'https://assets.pinterest.com/images/pidgets/pinit_fg_en_round_red_32.png';

declare global {
	interface Window {
		PinUtils?: { build: (element?: Element) => void };
	}
}

export function createPinterestLink(href: string, label: string): HTMLAnchorElement {
	const link = document.createElement('a');
	link.href = href;
	link.setAttribute('data-pin-do', 'buttonPin');
	link.setAttribute('data-pin-shape', 'round');
	link.setAttribute('data-pin-tall', 'true');
	link.setAttribute('aria-label', label);
	link.title = label;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	const badge = document.createElement('img');
	badge.src = badgeUrl;
	badge.alt = 'Save to Pinterest';
	badge.title = 'Save to Pinterest';
	badge.width = 32;
	badge.height = 32;
	link.append(badge);
	return link;
}

export function updatePinterestWidget(wrapper: HTMLElement, href: string, label: string): void {
	wrapper.dataset.pinterestLabel = label;
	wrapper.dataset.pinterestHref = href;
	const links = wrapper.querySelectorAll<HTMLAnchorElement>('a');
	if (links.length === 0) {
		wrapper.append(createPinterestLink(href, label));
		return;
	}
	links.forEach((link) => {
		link.href = href;
		if (link.hasAttribute('data-pin-href')) link.dataset.pinHref = href;
		link.setAttribute('aria-label', label);
		link.title = label;
	});
}

export function initPinterestWidgets(root: HTMLElement): MutationObserver {
	const pending = new WeakSet<HTMLAnchorElement>();
	function update(): void {
		root.querySelectorAll<HTMLElement>('[data-pinterest-widget]').forEach((wrapper) => {
			const label = wrapper.dataset.pinterestLabel;
			if (!label) return;
			const links = [...wrapper.querySelectorAll<HTMLAnchorElement>('a')];
			const original = links.find((link) => link.hasAttribute('data-pin-do'));
			if (wrapper.hasAttribute('data-pinterest-dynamic') && original && links.length === 1 && window.PinUtils && !pending.has(original)) {
				pending.add(original);
				window.PinUtils.build(wrapper);
			}
			wrapper.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
				if (wrapper.dataset.pinterestHref) {
					link.href = wrapper.dataset.pinterestHref;
					if (link.hasAttribute('data-pin-href')) link.dataset.pinHref = wrapper.dataset.pinterestHref;
				}
				link.setAttribute('aria-label', label);
				link.title = label;
				link.target = '_blank';
				link.rel = 'noopener noreferrer';
			});
		});
	}

	const observer = new MutationObserver(update);
	observer.observe(root, { childList: true, subtree: true });
	update();
	return observer;
}
