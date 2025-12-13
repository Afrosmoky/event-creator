# Canvas Sizing — Proposal (Option B)
Stała powierzchnia robocza Canvasu + dopasowanie do paneli bocznych  
Autor: ChatGPT  
Data: 2025-12-08

---

## 1. Aktualny problem

Canvas w projekcie ma:

- nieskończoną przestrzeń logiczną,
- ale SVG faktycznie nie ma wymiaru (`width`, `height`, `viewBox`),
- MoveController przesuwa elementy wewnątrz SVG, ale przez brak viewBox przestrzeń = viewport,
- co powoduje efekt „niewidzialnych ścian”.

Dzieje się to, ponieważ clampowane są współrzędne x ≥ 0, y ≥ 0, ale canvas wizualnie kończy się tam, gdzie kończy się viewport użytkownika.

---

## 2. Proponowane rozwiązanie (Opcja B)

### ➤ Canvas ma realną, stałą przestrzeń roboczą
Np.:

```
5000 × 3000 px
```

To jest **logiczny obszar**, po którym można przesuwać elementy.

Viewport (okno użytkownika) może być mniejszy — zoom oraz pan kontrolują widoczny wycinek.

### ➤ Ograniczenia przesuwania elementów odpowiadają realnym granicom canvasu
Elementy nie wyjdą poza obszar 0…5000 i 0…3000.

### ➤ Otwieranie paneli bocznych zmniejsza możliwy obszar roboczy
Jeśli panel ma 300 px, clamp na X zmienia się na:

```
minX = panelLeftWidth
maxX = canvasWidth - panelRightWidth - elementWidth
```

---

## 3. Zmiana w Canvas.tsx — ustawienie viewBox

```tsx
<svg
  class={css.canvas}
  viewBox="0 0 5000 3000"
  width="100%"
  height="100%"
  on:pointerup={e => controller.handlePointerUp(e)}
  on:pointerdown={e => controller.handlePointerDown(e)}
  on:pointermove={e => controller.handlePointerMove(e)}
  on:wheel={{ passive: false, handleEvent: e => controller.handleWheel(e) }}
  ref={ref => controller.target = ref}
>
```

Efekt:

- SVG ma stałą przestrzeń 5000×3000,
- użytkownik widzi tylko fragment (viewport),
- pan + zoom działają tak jak w Figma/Miro.

---

## 4. Dodanie stałych do projektu

Stwórz np. `canvasConfig.ts`:

```ts
export const CANVAS_WIDTH = 5000;
export const CANVAS_HEIGHT = 3000;

export const PANEL_LEFT = 300;   // opcjonalnie
export const PANEL_RIGHT = 350;  // opcjonalnie
```

---

## 5. Zmiana clamp w elementach (np. SquareTable)

Zamiast:

```ts
const clampedX = Math.max(0, x);
const clampedY = Math.max(0, y);
mutate(store, { x: clampedX, y: clampedY });
```

Nowe:

```ts
import { CANVAS_WIDTH, CANVAS_HEIGHT, PANEL_LEFT, PANEL_RIGHT } from '@/canvasConfig';

(x, y) => {
  const width = store.config.width;
  const height = store.config.height;

  const minX = PANEL_LEFT;
  const maxX = CANVAS_WIDTH - width - PANEL_RIGHT;

  const minY = 0;
  const maxY = CANVAS_HEIGHT - height;

  mutate(store, {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  });
}
```

---

## 6. Efekt końcowy

- Canvas staje się rzeczywistym obszarem roboczym.
- Elementy mogą być przesuwane w szerokim zakresie (np. do 5000 px).
- Zoom/pan nadal działa.
- Otwieranie paneli bocznych zmienia logiczną przestrzeń pracy.
- Znikają „niewidzialne ściany”.

---

## 7. Wariant przyszłościowy

Możliwe późniejsze rozszerzenia:

- dynamiczne powiększanie canvasu,
- nieskończony canvas,
- „auto-scroll” gdy element zbliża się do krawędzi viewportu.

---

## 8. Status

✔ gotowe do wdrożenia  
⚠ wymaga aktualizacji clampów we wszystkich elementach używających MoveController  
