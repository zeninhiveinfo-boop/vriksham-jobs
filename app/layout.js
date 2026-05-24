import './globals.css';
import AgentationDev from './components/agentation-dev';
import RootShellWrapper from '@/app/components/root-shell-wrapper';
import { getPublicAppBaseUrl } from '@/lib/site-url';
import { DEFAULT_SITE_NAME, getSystemBranding } from '@/lib/system-settings';

export async function generateMetadata() {
	const branding = await getSystemBranding();
	const baseUrl = getPublicAppBaseUrl();

	return {
		title: String(branding?.siteName || '').trim() || DEFAULT_SITE_NAME,
		metadataBase: new URL(baseUrl),
		description: 'Vriksham Jobs recruiting ATS and managed hiring platform',
		manifest: '/site.webmanifest',
		icons: {
			icon: [
				{ url: '/favicon.ico', sizes: 'any' },
				{ url: '/favicon.svg', type: 'image/svg+xml' },
				{ url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
			],
			apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }]
		}
	};
}

export default async function RootLayout({ children }) {
	const branding = await getSystemBranding();

	return (
		<html lang="en" data-theme={branding.themeKey}>
			<body>
				<RootShellWrapper>{children}</RootShellWrapper>
						<AgentationDev />
		</body>
		</html>
	);
}
