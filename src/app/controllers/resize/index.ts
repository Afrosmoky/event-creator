import type { ZoomController } from '@/app/controllers';
import type { Primitive, SetOptional, ConditionalPick } from 'type-fest';
import { untrack } from 'solid-js';


type PartialPrimitives<T extends object> = SetOptional<
  T,
  keyof ConditionalPick<T, Primitive | Element>
>;

export class ResizeController<S extends Record<string, unknown>, D = {}> {
  #lastX = 0;
  #lastY = 0;

  #currentTarget: Element | null = null;
  #capturingElement: Element | null = null;

  constructor(
    private readonly zoomController: ZoomController,
    public readonly storage: PartialPrimitives<S>,
    private readonly action: (
      reload: D | null,
      event: PointerEvent | null,
      element: Element | null,
      zoom: number,
      deltaX: number,
      deltaY: number,
      storage: S
    ) => void,
  ) {}

  #resize(
    reload: D | null,
    deltaX: number,
    deltaY: number,
    event: PointerEvent | null,
  ) {
    untrack(() => {
      this.action(
        reload,
        event,
        this.#currentTarget,
        this.zoomController.zoom,
        deltaX,
        deltaY,
        this.storage as unknown as S,
      );
    });
  }

  readonly #handlePointerMove = (e: PointerEvent) => {
    e.stopImmediatePropagation();

    const deltaX = e.clientX - this.#lastX;
    const deltaY = e.clientY - this.#lastY;

    this.#lastX = e.clientX;
    this.#lastY = e.clientY;

    this.#resize(null, deltaX / this.zoomController.zoom, deltaY / this.zoomController.zoom, e);
  };

  reload(data: D = {} as D) {
    this.#resize(data, 0, 0, null);
  }

  handlePointerDown(e: PointerEvent) {
    e.stopImmediatePropagation();
    if (e.button !== 0) return;

    this.#lastX = e.clientX;
    this.#lastY = e.clientY;

    this.#currentTarget = e.currentTarget as Element;
    this.#capturingElement = this.#currentTarget;

    this.#capturingElement.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this.#handlePointerMove);
  }

  handlePointerUp(e: PointerEvent) {
    e.stopImmediatePropagation();

    this.#capturingElement?.releasePointerCapture(e.pointerId);
    window.removeEventListener('pointermove', this.#handlePointerMove);
    this.#capturingElement = null;
    this.#currentTarget = null;
  }

  destroy() {
    window.removeEventListener('pointermove', this.#handlePointerMove);
  }
}
