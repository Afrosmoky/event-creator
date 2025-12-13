import type { ZoomController } from '@/app/controllers';
import { untrack } from 'solid-js';


export class MoveController {
  #x = 0;
  #y = 0;

  #lastX = 0;
  #lastY = 0;

  #capturingElement: Element | null = null;

  ref!: Element & ElementCSSInlineStyle;

  constructor(
    private readonly zoomController: ZoomController,
    private readonly updateHook?: (x: number, y: number) => void,
    private readonly extraDown?: () => void,
    private readonly extraUp?: () => void,
  ) {}

  move(x: number, y: number) {
    this.#x = x;
    this.#y = y;

    this.ref.style.transform = `translate(${x}px, ${y}px)`;
  }

  readonly #handlePointerMove = (e: PointerEvent) => {
    const deltaX = e.clientX - this.#lastX;
    const deltaY = e.clientY - this.#lastY;

    this.#lastX = e.clientX;
    this.#lastY = e.clientY;

    const newX = this.#x + (deltaX / this.zoomController.zoom);
    const newY = this.#y + (deltaY / this.zoomController.zoom);

    this.move(newX, newY);

    untrack(() => {
      this.updateHook?.(newX, newY);
    });
  };

  handlePointerDown(e: PointerEvent) {
    if (e.button !== 0 || (e.target as HTMLElement).draggable) return;

    untrack(() => {
      this.extraDown?.();
    });

    this.#lastX = e.clientX;
    this.#lastY = e.clientY;

    this.#capturingElement = this.ref;
    this.#capturingElement.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this.#handlePointerMove);
  }

  handlePointerUp(e: PointerEvent) {
    this.#capturingElement?.releasePointerCapture(e.pointerId);
    window.removeEventListener('pointermove', this.#handlePointerMove);
    this.#capturingElement = null;

    untrack(() => {
      this.extraUp?.();
    });
  }

  startMoving(e: { clientX: number; clientY: number; pointerId: number }) {
    untrack(() => {
      this.extraDown?.();
    });

    this.#lastX = e.clientX;
    this.#lastY = e.clientY;

    this.#capturingElement = this.ref;
    this.#capturingElement.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this.#handlePointerMove);
  }

  destroy() {
    window.removeEventListener('pointermove', this.#handlePointerMove);
  }
}
