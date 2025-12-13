export function setAttributeForwawrd<T extends Element, R>(
	element: T,
	attribute: string,
	fn: (value: string | null) => R,
): R {
	const value = fn(element.getAttribute(attribute));
	element.setAttribute(
		attribute,
		value as string,
	);
	return value;
}
