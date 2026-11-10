// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPinterestLink, initPinterestWidgets, updatePinterestWidget } from './pinterest-widget';

afterEach(() => {
	delete window.PinUtils;
	document.body.replaceChildren();
});

describe('Pinterest widgets', () => {
	it('restores an accessible name when Pinterest replaces a round button', async () => {
		// Arrange
		const wrapper = document.createElement('span');
		wrapper.dataset.pinterestWidget = '';
		wrapper.dataset.pinterestDynamic = '';
		wrapper.dataset.pinterestLabel = 'Save Red nails to Pinterest';
		wrapper.append(createPinterestLink('https://www.pinterest.com/pin/create/button/', wrapper.dataset.pinterestLabel));
		document.body.append(wrapper);
		window.PinUtils = { build: (element) => {
			const link = document.createElement('a');
			link.href = 'https://www.pinterest.com/pin/create/button/';
			element?.replaceChildren(link);
		} };

		// Act
		const observer = initPinterestWidgets(document.body);

		// Assert
		expect(wrapper.querySelector('a')?.getAttribute('aria-label')).toBe('Save Red nails to Pinterest');
		expect(wrapper.querySelector('a')?.title).toBe('Save Red nails to Pinterest');
		observer.disconnect();
	});

	it('initializes buttons inserted after Pinterest loads', async () => {
		// Arrange
		const observer = initPinterestWidgets(document.body);
		const wrapper = document.createElement('span');
		wrapper.dataset.pinterestWidget = '';
		wrapper.dataset.pinterestDynamic = '';
		wrapper.dataset.pinterestLabel = 'Save Blue nails to Pinterest';
		wrapper.append(createPinterestLink('https://www.pinterest.com/pin/create/button/', wrapper.dataset.pinterestLabel));
		window.PinUtils = { build: (element) => {
			const link = document.createElement('a');
			link.href = 'https://www.pinterest.com/pin/create/button/';
			element?.replaceChildren(link);
		} };

		// Act
		document.body.append(wrapper);
		await new Promise<void>((resolve) => setTimeout(resolve, 0));

		// Assert
		expect(wrapper.querySelector('a')?.getAttribute('aria-label')).toBe('Save Blue nails to Pinterest');
		expect(wrapper.querySelector('a')?.hasAttribute('data-pin-do')).toBe(false);
		observer.disconnect();
	});

	it('updates the Pinterest-generated target when the selected image changes', () => {
		// Arrange
		const wrapper = document.createElement('span');
		const link = document.createElement('a');
		link.href = 'https://www.pinterest.com/pin/create/button/?media=old';
		link.dataset.pinHref = link.href;
		wrapper.append(link);
		const href = 'https://www.pinterest.com/pin/create/button/?media=new';

		// Act
		updatePinterestWidget(wrapper, href, 'Save New nails to Pinterest');

		// Assert
		expect(link.href).toBe(href);
		expect(link.dataset.pinHref).toBe(href);
		expect(link.getAttribute('aria-label')).toBe('Save New nails to Pinterest');
	});

	it('does not rebuild a dynamic button while Pinterest is replacing it', async () => {
		// Arrange
		const wrapper = document.createElement('span');
		wrapper.dataset.pinterestWidget = '';
		wrapper.dataset.pinterestDynamic = '';
		wrapper.dataset.pinterestLabel = 'Save nails to Pinterest';
		wrapper.append(createPinterestLink('https://www.pinterest.com/pin/create/button/', wrapper.dataset.pinterestLabel));
		const build = vi.fn((element?: Element) => {
			const original = element?.querySelector('a');
			setTimeout(() => {
				if (!original) return;
				const replacement = document.createElement('a');
				replacement.href = original.href;
				original.replaceWith(replacement);
			}, 10);
		});
		window.PinUtils = { build };
		document.body.append(wrapper);
		const observer = initPinterestWidgets(document.body);

		// Act
		document.body.append(document.createElement('div'));
		await new Promise<void>((resolve) => setTimeout(resolve, 30));

		// Assert
		expect(build).toHaveBeenCalledTimes(1);
		expect(wrapper.querySelectorAll('a')).toHaveLength(1);
		expect(wrapper.querySelector('a')?.getAttribute('aria-label')).toBe('Save nails to Pinterest');
		observer.disconnect();
	});
});
