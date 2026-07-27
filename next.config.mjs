const commonSecurityHeaders = [
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'DENY' },
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' }
];

const productionSecurityHeaders = [
	{
		key: 'Content-Security-Policy',
		value: [
			"default-src 'self'",
			"base-uri 'self'",
			"form-action 'self'",
			"frame-ancestors 'none'",
			"object-src 'none'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob:",
			"font-src 'self' data:",
			"connect-src 'self'",
			'upgrade-insecure-requests'
		].join('; ')
	},
	{
		key: 'Strict-Transport-Security',
		value: 'max-age=31536000; includeSubDomains'
	}
];

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	serverExternalPackages: ['pdf-parse', '@napi-rs/canvas', 'word-extractor', 'mammoth'],
	async headers() {
		const headers = process.env.NODE_ENV === 'production'
			? [...commonSecurityHeaders, ...productionSecurityHeaders]
			: commonSecurityHeaders;
		return [
			{
				source: '/(.*)',
				headers
			},
			{
				source: '/client-review/:path*',
				headers: [
					{ key: 'Cache-Control', value: 'no-store' },
					{ key: 'Referrer-Policy', value: 'no-referrer' },
					{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }
				]
			},
			{
				source: '/api/client-review/:path*',
				headers: [
					{ key: 'Cache-Control', value: 'no-store' },
					{ key: 'Referrer-Policy', value: 'no-referrer' },
					{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }
				]
			}
		];
	}
};

export default nextConfig;
