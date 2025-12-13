function cropSvgToContent(svg: SVGSVGElement) {
	const {
		x,
		y,
		width,
		height,
	} = svg.getBBox();
	const viewBoxValue = [x, y, width, height].join(' ');
	svg.setAttribute('viewBox', viewBoxValue);
}

export async function svgToPngDataUrl(svg: SVGSVGElement): Promise<string> {
	const canvas = document.createElement('canvas');

	canvas.width = 3508; // TODO(ak): ???
	canvas.height = 2480;

	const ctx = canvas.getContext('2d')!;

	cropSvgToContent(svg);
	const xml = new XMLSerializer().serializeToString(svg);
	svg.removeAttribute('viewBox'); // added by cropSvgToContent

	const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
	const svgObjectUrl = URL.createObjectURL(svgBlob);

	return new Promise((resolve) => {
		const tempImg = new Image();
		tempImg.addEventListener('load', () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(tempImg, 0, 0);

			URL.revokeObjectURL(svgObjectUrl);

			resolve(canvas.toDataURL('image/png'));
		});

		tempImg.src = svgObjectUrl;
	});
}
