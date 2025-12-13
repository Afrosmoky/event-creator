export class DragController {
	#clicked = false;

	constructor(
		private readonly onDrag: (e: PointerEvent) => void,
	) {}

	handlePointerDown(_e: PointerEvent) {
		this.#clicked = true;
	}

	handlePointerMove(e: PointerEvent) {
		if (this.#clicked) {
			this.#clicked = false;
			this.onDrag(e);
		}
	}

	handlePointerUp(_e: PointerEvent) {
		this.#clicked = false;
	}
}
