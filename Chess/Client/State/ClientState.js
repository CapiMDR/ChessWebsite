import { white, black } from "../../Shared/Constants.js";
export const clientState = {
  color: white, //Color assigned to this client by the server (default white)
  flipBoard: false, //Controls whether the board should be drawn in black's perspective
  setColor(color) {
    this.color = color;
    this.flipBoard = color === black;
  },
};
