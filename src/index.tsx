import { render } from 'solid-js/web';
import './index.css';

import { I18nContextProvider } from './app/context/I18nContext.tsx';
import { SvgDrawerContextProvider } from './app/context/SvgDrawerContext.tsx';
import { App } from './app/index.tsx';

document.getElementById('spa-loader')!.outerHTML = '';

render(
  () => (
    <main class='relative w-screen h-screen overflow-hidden'>
			<I18nContextProvider>
				<SvgDrawerContextProvider>
					<App />
				</SvgDrawerContextProvider>
			</I18nContextProvider>
		</main>
  ),
  document.body
);
