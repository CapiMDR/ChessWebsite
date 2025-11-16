import { BoardSketch } from "./BoardRenderer.js";
import { UISketch } from "./UIRenderer.js";

// Create both canvases independently here
export const boardP5 = new p5(BoardSketch);
export const uiP5 = new p5(UISketch);
