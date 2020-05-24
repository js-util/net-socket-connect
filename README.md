# net-socket-connect

Given the remote port/host, setup a low level, net.Socket. With callbacks and connect timeout!

# npm install

```.bash
npm install --save @js-util/net-socket-connect
```

# Example usage

> PS: This is incomplete code, you will need to modify for your actual use case.

```.js
// Load the module
const netSocketTimeout = require("@js-util/net-socket-connect);

// Create the server with the socket listening event
let remotesocket = netSocketTimeout(80, "127.0.0.1", (socket, err) => {
	
	if( err ) {
		console.error(err);
		return;
	}

	doSomethingWithSocket(socket);

}, 5000 /* connect timeout in ms */ );
```
