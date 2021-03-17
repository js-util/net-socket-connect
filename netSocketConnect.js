const net = require("net");

/**
 * Return true, if port is within valid int range
 * 
 * @param {int} port 
 * @return {boolean} true if port is valid
 */
function isValidPort(port) {
	return port > 0 && port <= 65535;
}

/**
 * Given the remote port/host, setup a low level, net.Socket, and perform the callback
 * only on succesful connection, or error. Including the option for having a connection timeout.
 * 
 * This function is intentionally designed designed to use a single callback instead of "promises", 
 * due to the tighter low latency reqirement for the proxy backend.
 *
 * In most cases, I would prefer promises in node js, however this is effectively networking code. So ....
 * 
 * External benchmark: https://gist.github.com/ColonelBundy/d57fb9cd16eb87b2d4d932acc1055b30
 * 
 * @param {Int} remoteport 
 * @param {String} remotehost (defaults to localhost if null)
 * @param {Function(Socket,Error)} callback to return with either socket or error
 * @param {Int} connectTimeout in milliseconds (default 5,000 ms)
 * 
 * @return {net.Socket} that was made, regardless of callback outcome
 */
function netSocketConnect(remoteport, remotehost, callback = null, connectTimeout = 5000) {
	// Callback to trigger, at most once
	let triggered = false;
	function triggerCallback(socket, error) {
		// Does nothing if triggered
		if( triggered ) {
			return;
		}
		triggered = true;

		// Perform the callback
		if( callback ) {
			callback(socket, error);
		}
	}

	// Check remoteport
	remoteport = parseInt(remoteport);
	if( !isValidPort(remoteport) ) {
		triggerCallback(null, `EPARAM - Invalid port number provided - ${remotehost}:${remoteport}`);
		return;
	}

	// Setup the socket connection
	let remotesocket = new net.Socket();

	// Setup the connect / error event
	remotesocket.on("connect", () => {
		triggerCallback(remotesocket, null);
	});
	remotesocket.on("error", (err) => {
		triggerCallback(null, err || "ERROR");
	});

	// Trigger the connection
	if(remotehost) {
		remotesocket.connect( remoteport, remotehost);
	} else {
		remotesocket.connect( remoteport );
	}

	// Handle the timeout
	setTimeout(() => {
		if(!triggered) {
			triggerCallback(null, `ETIMEDOUT (${connectTimeout}ms) - ${remotehost}:${remoteport}`);
			remotesocket.destroy();
		}
	}, connectTimeout)

	// Return the socket
	return remotesocket;
}
module.exports = netSocketConnect;