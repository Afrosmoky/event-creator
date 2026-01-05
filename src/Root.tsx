import { App } from '@/app/index.tsx';
import { SvgDrawerContextProvider } from './app/context/SvgDrawerContext';
import { I18nContextProvider } from './app/context/I18nContext';

export function Root() {
	return (
		<main class='relative w-screen h-screen overflow-hidden'>
			<I18nContextProvider>
				<SvgDrawerContextProvider>
					<App />
				</SvgDrawerContextProvider>
			</I18nContextProvider>
		</main>
	);
}
