const MIN_SCALE = 0.25;
const MAX_SCALE = 10;
const ZOOM_SPEED = 0.005;

type ZoomState = [zoom: number, x: number, y: number];

export class ZoomController {
	zoom = 1;

	panX = 0;
	panY = 0;

	#lastX = 0;
	#lastY = 0;

	#isPanning = false;

	ref!: Element & ElementCSSInlineStyle;
	target!: Element & ElementCSSInlineStyle;
	overlay?: Element & ElementCSSInlineStyle;

	positionOverlay?: Element;

	constructor(
		private readonly name: string,
		private readonly onFocus: () => void,
	) {}

	#updatePositionOverlay(e: MouseEvent) {
		if (this.positionOverlay !== undefined) {
			const x = (e.clientX - this.panX) / this.zoom;
			const y = (e.clientY - this.panY) / this.zoom;
			this.positionOverlay.textContent = `x: ${Math.trunc(x)} y: ${Math.trunc(y)}`;
		}
	}

	#applyTransform(zoom: number, panX: number, panY: number) {
		this.zoom = zoom;
		this.panX = panX;
		this.panY = panY;

		const bgStep = 14 * zoom;

		this.target.style.backgroundSize = `${bgStep}px ${bgStep}px`;
		this.target.style.backgroundPosition = `${panX}px ${panY}px`;

		const transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;

		this.ref.style.transform = transform;

		if (this.overlay) {
			this.overlay.style.transform = transform;
		}

		localStorage.setItem(
			`${this.name}-zoom`,
			JSON.stringify([zoom, panX, panY] satisfies ZoomState),
		);
	}

	handleMount() {
		const persisted = localStorage.getItem(`${this.name}-zoom`);
		if (persisted != null) {
			const [zoom, x, y] = JSON.parse(persisted) as ZoomState;
			this.#applyTransform(zoom, x, y);
		}
	}

	handleWheel(e: WheelEvent) {
		e.preventDefault();
		e.stopImmediatePropagation();

		this.#updatePositionOverlay(e);

		/**
		 * WHAT THE ACTUAL FUCK?
		 * This isn't actually fucking specified in the w3c's spec,
		 * but *MAGICALLY* supported in all browsers???
		 *
		 * Just don't touch this part, really, lol. It JUST WORKS now.
		 *
		 * BUT another semi-correct implementation could be like this:
		 * if (e.deltaY !== 0 && Number.isInteger(e.deltaY) && !e.shiftKey) {
		 * (but this *SOMETIMES STOPS* working correctly in Chrome after January 2025, WHAT?)
		 *
		 * YEAH, I previously used shiftKey just because YES,
		 * and... It almost gave me a nervous breakdown, damn.
		 */
		if (!e.ctrlKey) {
			this.#applyTransform(this.zoom, this.panX - e.deltaX, this.panY - e.deltaY);
		} else {
			const rect = this.target.getBoundingClientRect();

			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			let newScale = this.zoom * (1 - e.deltaY * ZOOM_SPEED);

			// Clamp scale
			newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

			// Calculate zoom point preservation
			const scaleRatio = newScale / this.zoom;

			const newX = mouseX - (mouseX - this.panX) * scaleRatio;
			const newY = mouseY - (mouseY - this.panY) * scaleRatio;

			this.#applyTransform(newScale, newX, newY);
		}
	}

	handlePointerDown(e: PointerEvent) {
		if (e.button === 2 || (e.button !== 0 || e.target !== this.target)) {
			return;
		}

		this.onFocus();

		this.#isPanning = true;

		this.#lastX = e.clientX;
		this.#lastY = e.clientY;

		(e.target as Element).setPointerCapture(e.pointerId);
	}

	handlePointerUp(e: PointerEvent) {
		this.#isPanning = false;
		(e.target as Element).releasePointerCapture(e.pointerId);
	}

	handlePointerMove(e: PointerEvent) {
		this.#updatePositionOverlay(e);

		if (!this.#isPanning) {
			return;
		}

		const deltaX = e.clientX - this.#lastX;
		const deltaY = e.clientY - this.#lastY;

		this.#lastX = e.clientX;
		this.#lastY = e.clientY;

		this.#applyTransform(this.zoom, this.panX + deltaX, this.panY + deltaY);
	}

	panTo(x: number, y: number) {
		this.#applyTransform(this.zoom, x, y);
	}
}
