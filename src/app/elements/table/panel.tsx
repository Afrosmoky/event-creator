import { TextFieldRoot, TextFieldInput, TextFieldLabel } from '@/components/TextField';

import { untrack } from 'solid-js';

import type { WithStoreProps } from '@/app/utils';
import { TAU } from '@/app/utils';

import type { TableState } from '.';

export function PanelTable(props: WithStoreProps<TableState>) {
	const store = untrack(() => props.store);
	const config = store.config;

	// if (config.type !== 'circle') {
	// 	throw new Error('BUG');
	// }

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
				<TextFieldLabel>Promień</TextFieldLabel>
				<TextFieldInput
					type='number'
					// @ts-ignore
					value={config.radius}
					// @ts-ignore
					onChange={e => config.radius = +e.target.value}
				/>
			</TextFieldRoot>

			<TextFieldRoot>
				<TextFieldLabel>Liczba siedzeń</TextFieldLabel>
				<TextFieldInput
					type='number'
					value={store.seats}
					// @ts-ignore
					onChange={e => store.spacing = Math.max(30, TAU * config.radius / +e.target.value)}
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
