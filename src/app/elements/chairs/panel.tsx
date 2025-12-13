import { TextFieldRoot, TextFieldInput, TextFieldLabel } from '@/components/TextField';

import { untrack } from 'solid-js';

import type { WithStoreProps } from '@/app/utils';

import type { ChairsState } from '.';

export function PanelChairs(props: WithStoreProps<ChairsState>) {
	const store = untrack(() => props.store);

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
					value={store.config.width}
					onChange={e => store.config.width = +e.target.value}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Liczba siedzeń</TextFieldLabel>
				<TextFieldInput
					type='number'
					value={store.seats}
					onChange={e => store.seats = +e.target.value}
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
