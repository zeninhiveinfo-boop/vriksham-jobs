import sanitizeHtml from 'sanitize-html';
import { hasMeaningfulRichTextContent } from './rich-text.js';

const ALLOWED_TAGS = [
	'p',
	'div',
	'br',
	'ul',
	'ol',
	'li',
	'strong',
	'b',
	'em',
	'i',
	'u',
	'blockquote',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'a',
	'span'
];

const SANITIZE_OPTIONS = {
	allowedTags: ALLOWED_TAGS,
	allowedAttributes: {
		a: ['href', 'target', 'rel'],
		span: ['style']
	},
	allowedSchemes: ['http', 'https', 'mailto'],
	allowProtocolRelative: false,
	allowedStyles: {
		span: {
			'font-weight': [/^(normal|bold|[1-9]00)$/],
			'font-style': [/^(normal|italic)$/],
			'text-decoration': [/^(none|underline)$/]
		}
	},
	transformTags: {
		a: (tagName, attributes) => ({
			tagName,
			attribs: {
				...attributes,
				...(attributes.target === '_blank'
					? { rel: 'noopener noreferrer' }
					: {})
			}
		})
	}
};

export function sanitizeRichTextHtml(value) {
	const sanitized = sanitizeHtml(String(value ?? ''), SANITIZE_OPTIONS).trim();
	return hasMeaningfulRichTextContent(sanitized) ? sanitized : null;
}
