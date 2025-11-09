//Runs a game between 2 clients, validates legality of moves made and coordinates position/timers/game start/game end
import { Engine, GameResult } from "../Shared/Engine.js";
import { Timer } from "../Shared/Timer.js";
import { Move } from "../Shared/Move.js";
import { white, black } from "../Shared/Constants.js";
import { sendToAllClients, respondToClient } from "./server.js";

const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let engine;

let whiteTimer;
const whiteTime = 0.05; //Initial time in minutes
const whiteIncrement = 3; //In seconds
let blackTimer;
const blackTime = 0.05;
const blackIncrement = 3;

engine = new Engine(startFEN);
whiteTimer = new Timer(whiteTime, whiteIncrement);
blackTimer = new Timer(blackTime, blackIncrement);
engine.setTimers(whiteTimer, blackTimer);

//Listening to timer events
whiteTimer.addEventListener("timeout", () => handleServerTimeout(white));
blackTimer.addEventListener("timeout", () => handleServerTimeout(black));

//Notify all clients that the game is over
function handleServerTimeout(color) {
  if (gameIsOver()) return;

  engine.result = color === white ? GameResult.whiteTimeOut : GameResult.blackTimeOut;
  endGame();
}

//Map of playerId to their assigned color
let colorAssignments = { [white]: null, [black]: null };
//Map of players who started the game to allow reconnection
let originalPlayers = { [white]: null, [black]: null };

export function handlePlayerReady(socket, playerId) {
  //Assign color to the player. If both colors taken, assign spectator. If reconnecting, assign original color.
  const assignedColor = assignColor(playerId);
  respondToClient(socket, { type: "color", color: assignedColor });

  //Sync the client's game if they connected/reconnected in the middle of the match
  if (gameHasStarted()) {
    const gameStatus = getGameStatus();
    respondToClient(socket, { type: "syncGame", gameStatus: gameStatus });
    respondToClient(socket, { type: "startGame" });
    return;
  }

  //Start game when both players ready (both colors assigned)
  if (!gameIsReady()) return;
  startGame();
  sendToAllClients({ type: "startGame" });
}

export function assignColor(playerId) {
  if (gameHasStarted()) {
    //Only original players can rejoin
    for (const color of [white, black]) {
      if (originalPlayers[color] === playerId) {
        colorAssignments[color] = playerId;
        console.log("Original " + (color == white ? "white" : "black") + " player reconnected");
        return color;
      }
    }
    return "spectator";
  }

  //Before game starts assign available color
  const availableColors = [];
  if (!colorAssignments[white]) availableColors.push(white);
  if (!colorAssignments[black]) availableColors.push(black);

  if (availableColors.length > 0) {
    const assigned = availableColors[Math.floor(Math.random() * availableColors.length)];
    colorAssignments[assigned] = playerId;
    return assigned;
  }

  return "spectator";
}

export function handleDisconnect(playerId) {
  //Clearing color assignment if game hasn't started yet when a player disconnects
  if (gameHasStarted()) return;
  if (colorAssignments[white] === playerId) colorAssignments[white] = null;
  if (colorAssignments[black] === playerId) colorAssignments[black] = null;
}

export function startGame() {
  //Setup new game
  engine.startGame();

  //Keep track of the two players who started the game
  originalPlayers[white] = colorAssignments[white];
  originalPlayers[black] = colorAssignments[black];
}

function endGame() {
  const gameStatus = getGameStatus();
  sendToAllClients({ type: "endGame", gameStatus });

  //TODO: Store game in database
}

export function handleReceivedMove(move) {
  //If the server receives a move from a client, validate it and resend it to everyone
  if (!isLegalMove(move)) return;
  const gameStatus = getGameStatus();
  sendToAllClients({ type: "move", move: move, gameStatus: gameStatus });
  //If the game is over after the move, notify clients
  if (gameIsOver()) endGame();
}

export function isLegalMove(clientMove) {
  for (let move of engine.moves) {
    //Move from client matches legal move from the server
    if (move == clientMove) {
      //Make move on internal server board copy
      console.log("Received move " + Move.toString(clientMove));
      engine.playMove(clientMove, false);
      //Tell server to notify all clients that a legal move was made
      return true;
    }
  }
  console.log("Received illegal move " + Move.toString(clientMove));
  return false;
}

export function gameIsReady() {
  return colorAssignments[white] && colorAssignments[black];
}

export function gameHasStarted() {
  return engine.result != GameResult.starting;
}

export function gameIsOver() {
  return engine.result != GameResult.starting && engine.result != GameResult.inProgress;
}

//Returns game status on server to sync players on disconnect/reconnect and whenever the server receives a move
export function getGameStatus() {
  return {
    clrToMove: engine.clrToMove,
    movesList: engine.moveHistory,
    whiteTime: whiteTimer.remainingTime,
    blackTime: blackTimer.remainingTime,
    gameResult: engine.result,
  };
}
