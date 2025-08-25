class proxy{
	constructor(activeTunnels, tunnelConnections) {
		this.activeTunnels = activeTunnels;
		this.tunnelConnections = tunnelConnections;
	}

	handleRequest(req, res, next) {
		const host = req.get('Host');
		const parts = host.split('.');

		if (parts.length > 2) {
			const subdomain = parts[0];

			if (this.activeTunnels.has(subdomain)) {
				const tunnel = this.activeTunnels.get(subdomain);
				const connection = this.tunnelConnections.get(subdomain);

				if (connection && tunnel.status === 'active') {
					this.forwardRequest(req, res, connection);
				} else {
					res.status(502).send('Tunnel not available');
				}
			} else {
				next(); 
			}
		} else {
			next()
		}
	}
	forwardRequest(req, res, connection) {
		connection.emit('proxy-request', {
			method: req.method,
			url: req.url,
			headers: req.headers,
			body: req.body,
			query: req.query
		});

		connection.once('proxy-response', (response) => {
			res.status(response.status || 200);

			if (response.headers) {
				Object.keys(response.headers).forEach((key) => {
					res.set(key, response.headers[key]);
				});
			}

			res.send(response.body || '');
		});

		setTimeout(() => {
			if (!res.headersSent) {
				res.status(504).send('Gateway Timeout');
			}
		}, 30000);
	}
}


module.exports = proxy;