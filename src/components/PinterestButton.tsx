import { useEffect, useRef } from 'react';
import { updatePinterestWidget } from '../adapters/presentation/human/pinterest-widget';

export default function PinterestButton({ href, label }: { href: string; label: string }) {
	const wrapper = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (wrapper.current) updatePinterestWidget(wrapper.current, href, label);
	}, [href, label]);

	return <span ref={wrapper} className="pinterest-widget" data-pinterest-widget data-pinterest-dynamic data-pinterest-label={label} />;
}
