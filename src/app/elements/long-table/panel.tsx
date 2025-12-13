import { TextFieldRoot, TextFieldInput, TextFieldLabel } from '@/components/TextField';

import { untrack } from 'solid-js';

import type { WithStoreProps } from '@/app/utils';

import type { LongTableState } from './index.tsx';
import { calculateRectTableSize, calculateRequiredSpacing } from './math.ts';

export function PanelLongTable(props: WithStoreProps<LongTableState>) {
	const store = untrack(() => props.store);
	const config = store.config;

	if (store.kind !== 'long-table') {
		throw new Error('BUG');
	}

	return (
		<>
			<TextFieldRoot>
				<TextFieldLabel>Nazwa</TextFieldLabel>
				<TextFieldInput
					value={store.name}
					onChange={e => store.name = e.target.value}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Szerokość</TextFieldLabel>
				<TextFieldInput
					type='number'
					// @ts-ignore
					value={config.width}
					// @ts-ignore
					onChange={e => config.width = +e.target.value}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Długość</TextFieldLabel>
				<TextFieldInput
					type='number'
					// @ts-ignore
					value={config.height}
					// @ts-ignore
					onChange={e => config.height = +e.target.value}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Liczba siedzeń</TextFieldLabel>
				<TextFieldInput
							type='number'
							max="30"
							value={store.seats}
							onChange={e => {
									const newSeats = +e.target.value; // Pobierz nową liczbę siedzeń
									store.seats = newSeats;
			
									// Oblicz wymiar stołu na podstawie liczby siedzeń
								
									// Oblicz wymagany rozstaw między siedzeniami
								// @ts-ignore
									const spacing = calculateRequiredSpacing(newSeats,config.height, config.width, 40);
			
									const tableSize = calculateRectTableSize(newSeats, spacing);
			
									// Zaktualizuj szerokość i wysokość stołu
								// @ts-ignore
									config.width = tableSize.width;
								// @ts-ignore
									config.height = tableSize.height;
			
			
									// Zaktualizuj rozstaw
									store.spacing = spacing;
							}}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Rozstaw</TextFieldLabel>
				<TextFieldInput
					type='number'
					value={store.spacing}
					onChange={e => store.spacing = +e.target.value}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Kolor</TextFieldLabel>
				<TextFieldInput
					type='color'
					value={store.color}
					onChange={e => store.color = e.target.value}
				/>
			</TextFieldRoot>
		</>
	);
}
