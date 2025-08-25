class socket{
	constructor(io,activeTunnels, tunnelConnections) {
		this.io = io;
		this.activeTunnels = activeTunnels;
		this.tunnelConnections = tunnelConnections;
	}


	attach(io){
		this.io.on('connection',(socket)=>{
			console.log('client connected:',socket.id)

			socket.on('register-tunnel',(data)=>{
				this.registerTunnel(socket,data)
			})

			socket.on('disconnect',()=>{
				this.handleDisconnect()
			})

		})
	}


	registerTunnel(socket,data){
		const { tunnel_id, subdomain } = data;
		if (this.activeTunnels.has(subdomain)) {
			this.tunnelConnections.set(subdomain,socket)
			this.activeTunnels.get(subdomain).status = 'active'

			socket.emit('tunnel-registered',{status:'success'})
		}else{
			socket.emit('tunnel-error', { error: 'Invalid tunnel' });
		}
	}

	handleDisconnect(socket) {
		console.log('Client disconnected:', socket.id);

		for (const [subdomain, conn] of this.tunnelConnections.entries()) {
			if (conn === socket) {
				this.tunnelConnections.delete(subdomain);
				if (this.activeTunnels.has(subdomain)) {
					this.activeTunnels.get(subdomain).status = 'disconnected';
				}
				break;
			}
		}
	}
}



module.exports =  socket;