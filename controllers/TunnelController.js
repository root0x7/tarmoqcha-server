const { v4:uuidv4 } = require('uuid')

class TunnelController{

	constructor(){
		this.activeTunnels = new Map()
		this.tunnelConnections = new Map()
	}

	getTunells(req,res){
		const { subdomain, port, local_host } = req.body;
		if (this.activeTunnels.has(subdomain)) {
			return res.status(409).json({
				error: 'Subdomain already in use',
				message: `Subdomain '${subdomain}' is already taken`
			});
		}

		const tunnelId = uuidv4();
		const publicUrl = `https://${subdomain}.yourdomain.com`;

		this.activeTunnels.set(subdomain,{
			id: tunnelId,
			subdomain,
			port,
			local_host,
			public_url: publicUrl,
			created_at: new Date(),
			status: 'pending'
		})

		return res.json({
			tunnel_id: tunnelId,
			public_url: publicUrl,
			subdomain,
			status: 'created'
		});
	}

	getTunnel(req, res) {
		const { subdomain } = req.params;
		const tunnel = this.activeTunnels.get(subdomain);

		if (!tunnel) {
			return res.status(404).json({ error: 'Tunnel not found' });
		}

		return res.json(tunnel);
	}
}


module.exports = new TunnelController()