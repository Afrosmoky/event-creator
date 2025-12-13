// shit for cropping svg's viewbox

import { render } from 'solid-js/web';

const assets = [
	'/air-conditioner.svg',
	'/arrow.svg',
	'/cake.svg',
	'/caution-sign.svg',
	'/compass.svg',
	'/dance-area.svg',
	'/disability-sing.svg',
	'/dj-controller.svg',
	'/electrical-outlet.svg',
	'/fan.svg',
	'/firework.svg',
	'/gifts.svg',
	'/heater.svg',
	'/high-chair-sign.svg',
	'/label.svg',
	'/left door.svg',
	'/light.svg',
	'/long-table.svg',
	'/microphone.svg',
	'/pillar.svg',
	'/right-door.svg',
	'/round-table.svg',
	'/row-of-chairs.svg',
	'/smoke.svg',
	'/sound.svg',
	'/square-table.svg',
	'/stage.svg',
	'/strainght-wall.svg',
	'/target.svg',
	'/tent.svg',
	'/toilet-sign.svg',
	'/tree.svg',
	'/water.svg',
] as const;

function cropSvgToContent(svg: SVGSVGElement) {
	const {
		x,
		y,
		width,
		height,
	} = svg.getBBox({
		fill: true,
		stroke: true,
		markers: true,
		clipped: true,
	});
	const viewBoxValue = [x - (8 / 2), y - (8 / 2), width + 8, height + 8].join(' ');
	// const viewBoxValue = [x, y, width, height].join(' ');

	svg.setAttribute('viewBox', viewBoxValue);

	svg.setAttribute('width', width.toString());
	svg.setAttribute('height', height.toString());
}

function Test() {
	let ref!: HTMLDivElement;

	const handler = async () => {
		const directory = await window.showDirectoryPicker();

		for (const asset of assets) {
			let svg = ref.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
			svg.outerHTML = await fetch(asset).then(async res => res.text());
			svg = ref.lastElementChild as SVGSVGElement;
			cropSvgToContent(svg);

			const svgBlob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });

			const fileHandle = await directory.getFileHandle(asset.substring(1), { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(svgBlob);
			await writable.close();

			svg.remove();
		}
	};

	return (
		<>
			<div ref={ref} />
			<button onClick={handler}>Start</button>
		</>
	);
}

render(() => <Test />, document.getElementById('root')!);
