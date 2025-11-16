// Shared input + board interaction state
export let selectedSquare = null;
export let selectToggle = true;
export let dragging = false;

export function setSelectedSquare(square) {
  selectedSquare = square;
}

export function toggleSelect(currentSquare) {
  selectToggle = !selectToggle;
  if (selectedSquare !== currentSquare) selectToggle = false;
}

export function resetSelection() {
  selectedSquare = null;
  selectToggle = true;
}

export function setDragging(value) {
  dragging = value;
}
