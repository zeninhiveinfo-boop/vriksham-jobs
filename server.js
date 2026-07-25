const http = require('node:http');
const { parse } = require('node:url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
	.prepare()
	.then(() => {
		http
			.createServer((request, response) => {
				const parsedUrl = parse(request.url, true);
				handle(request, response, parsedUrl);
			})
			.listen(port, hostname, () => {
				console.log(`Vriksham Jobs listening on ${hostname}:${port}`);
			});
	})
	.catch((error) => {
		console.error('Unable to start Vriksham Jobs.', error);
		process.exit(1);
	});
