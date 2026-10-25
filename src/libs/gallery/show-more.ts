export function initShowMore(root: HTMLElement, button: HTMLButtonElement, status: HTMLElement): void {
	const batchSize = Number(button.dataset.batchSize);
	const totalCount = Number(button.dataset.totalCount);
	const deferredCards = [...root.querySelectorAll<HTMLElement>('[data-gallery-deferred][hidden]')];
	let shownCount = totalCount - deferredCards.length;

	if (!Number.isSafeInteger(batchSize) || batchSize <= 0 || !Number.isSafeInteger(totalCount)
		|| totalCount <= deferredCards.length || shownCount < 0) {
		throw new Error('Invalid design gallery show-more configuration.');
	}

	button.addEventListener('click', () => {
		const nextBatch = deferredCards.filter((card) => card.hasAttribute('hidden')).slice(0, batchSize);
		for (const card of nextBatch) card.removeAttribute('hidden');
		shownCount += nextBatch.length;

		if (shownCount >= totalCount) {
			status.textContent = `All ${totalCount} designs shown`;
			button.remove();
		} else {
			status.textContent = `Showing ${shownCount} of ${totalCount} designs`;
		}

		nextBatch[0]?.querySelector<HTMLButtonElement>('[data-gallery-src]')?.focus();
	});
}
