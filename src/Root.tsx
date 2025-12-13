// import { ZoomableImage } from './test.tsx';

import { App } from '@/app/index.tsx';

export function Root() {
	return (
		<>
			{/* drag-n-drop image */}
			<img
				id='drag-image'
				src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLW1vdXNlLXBvaW50ZXItY2xpY2siPjxwYXRoIGQ9Ik0xNCA0LjEgMTIgNiIvPjxwYXRoIGQ9Im01LjEgOC0yLjktLjgiLz48cGF0aCBkPSJtNiAxMi0xLjkgMiIvPjxwYXRoIGQ9Ik03LjIgMi4yIDggNS4xIi8+PHBhdGggZD0iTTkuMDM3IDkuNjlhLjQ5OC40OTggMCAwIDEgLjY1My0uNjUzbDExIDQuNWEuNS41IDAgMCAxLS4wNzQuOTQ5bC00LjM0OSAxLjA0MWExIDEgMCAwIDAtLjc0LjczOWwtMS4wNCA0LjM1YS41LjUgMCAwIDEtLjk1LjA3NHoiLz48L3N2Zz4='
				class='fixed left-[-999999px]'
			/>

			<main class='w-screen h-screen'>
				<App />
			</main>
		</>
	);
}
