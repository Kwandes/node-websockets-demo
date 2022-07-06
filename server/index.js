import { createServer } from "http";
import { WebSocketServer } from "ws";

const httpPort = 8080;
const wsPort = 8081;

const server = createServer(); // Http server
const wss = new WebSocketServer({ port: wsPort });

const clients = new Map(); // list of connected clients

wss.on("connection", function connection(ws, req) {
  // logic that occurs for every new connection
  const id = clients.length; // IDs to identify different connected clients
  const metadata = { id };

  clients.set(ws, metadata);
  console.log(`New connection with ${req.socket.remoteAddress}`);
  // Send a simple message to the connected client
  ws.send("Connection established");

  // Handle incoming messages
  ws.on("message", function message(data) {
    console.log(`Received from ${req.socket.remoteAddress}: %s`, data);
    // TODO - handle different messages
    ws.send("Message acknowledged and politely ignored");
  });

  // Handle closing of the connection
  ws.on("close", () => {
    console.log(`Closing connection with ${req.socket.remoteAddress}`);
    clients.delete(ws);
  });
});

// If the HTTP server gets hit with a websocket request, "upgrade" the request to create a conenction with the websocket server instead of http.
// Allows creation of websocket connections using the exposed http server port
// TODO - figure out why after the upgrade the websocket server logic doesn't actually trigger
server.on("upgrade", function upgrade(request, socket, head) {
  console.log("Upgrade endpoint got triggered");
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("Connection", ws, request);
  });
});

server.listen(httpPort);
