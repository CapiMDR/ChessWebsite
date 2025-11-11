/*
 * Handles communication with the server.js
 */

export const host = window.location.hostname; //Current host ip
export const port = 3000; //Node server port
let socket;
let joinedMatchID; //The current match ID assigned to this client by the server

export function startConnection() {
  //Generate or retrieve unique player ID
  let playerId = localStorage.getItem("playerId");
  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
  }

  //Connecting to server with unique player ID
  socket = io(`https://${host}:${port}`, { query: { playerId } });

  //Message handler for messages received from server
  socket.on("message", (msg) => {
    if (msg.type == "joinMatch") joinedMatchID = msg.matchID;
    serverEvents.dispatchEvent(new CustomEvent(msg.type, { detail: msg }));
  });
}

export function sendToServer(msgContent) {
  //Attaching this client's match ID to the message for the server so that it can distinguish from which match it originated from
  msgContent.matchID = joinedMatchID;
  socket.emit("message", msgContent);
}

export const serverEvents = new EventTarget();
