import { Button } from '@/components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover';

import { untrack } from 'solid-js';

import type { ZoomController } from '@/app/controllers';
import { useCanvasState } from '@/app/context';
import { download, svgToPngDataUrl } from '@/app/utils';

import { AddItemMenu } from './components/add-item-menu';

import * as css from './styles.module.css';

export interface BottomMenuProps {
	zoomController: ZoomController;
	guestList: () => boolean;
	handleGuestList: () => void;
}

export function BottomMenu(props: BottomMenuProps) {
	const zoomController = untrack(() => props.zoomController);

	const store = useCanvasState();



	return (
		<div class={css.menu}>
			<Popover open={store.menu} onOpenChange={value => store.menu = value}>
				<PopoverTrigger as={Button}>Dodaj element</PopoverTrigger>
				<PopoverContent>
					<AddItemMenu zoomController={zoomController} />
				</PopoverContent>
			</Popover>

			<Button
				onClick={async () => {
					zoomController.ref.style.filter = 'url(#canvas-grayscale)';
					download(
						'canvas.png',
						await svgToPngDataUrl(zoomController.target as SVGSVGElement),
					);
					zoomController.ref.style.filter = '';
				}}
			>
				Pobierz SVG
			</Button>

			<Button onClick={() => zoomController.panTo(0, 0)}>
				Wyśrodkuj
			</Button>

			<Button onClick={props.handleGuestList}>
				{props.guestList() ? 'Ukryj listę Gości' : 'Pokaż listę Gości'}
			</Button>

			
		</div>
	);
}
