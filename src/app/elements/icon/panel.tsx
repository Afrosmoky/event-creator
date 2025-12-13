import { Icon as IconComponent } from '@/components/Icon';

import { For, untrack } from 'solid-js';

import type { SpritesMap } from '@/sprite.gen.ts';
import type { WithStoreProps } from '@/app/utils';
import { SPRITES_META } from '@/sprite.gen.ts';
import { iconTranslations } from '@/app/constants';
import type { IconState } from '.';


export function PanelIcon(props: WithStoreProps<IconState>) {
	const store = untrack(() => props.store);

	return (
		<div class='scrollbar-hidden flex flex-col items-center overflow-y-scroll'>
		<For each={Object.keys(SPRITES_META.sprite.items) as SpritesMap['sprite'][]}>
  {item => {

    return (
      <div class='flex flex-col text-center' onClick={() => store.config.icon = item}>
        { iconTranslations[item] || item}
        <IconComponent name={`sprite/${item}`} class='size-[128px]' />
      </div>
    );
  }}
</For>
		</div>
	);
}
