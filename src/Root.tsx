import { App } from '@/app/index.tsx';
import { SvgDrawerContextProvider } from './app/context/SvgDrawerContext';
import { I18nContextProvider } from './app/context/I18nContext';

export function Root() {
	return (
		<main class='w-screen h-screen'>
			<I18nContextProvider>
				<SvgDrawerContextProvider>
					<App />
				</SvgDrawerContextProvider>
			</I18nContextProvider>
		</main>
	);
}
