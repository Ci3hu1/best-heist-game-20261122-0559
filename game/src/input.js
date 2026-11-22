// Keyboard and mouse input. WASD / arrows move, a click tosses a coin,
// Enter starts, R restarts. The canvas is 1280x720 and shown at that size,
// so click coordinates map straight onto the room.
export function createInput(canvas) {
  const keys = new Set();
  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    clicked: null, // {x, y} in canvas pixels, consumed by the loop
    pressedEnter: false,
    pressedRestart: false,
  };

  function sync() {
    input.left = keys.has('KeyA') || keys.has('ArrowLeft');
    input.right = keys.has('KeyD') || keys.has('ArrowRight');
    input.up = keys.has('KeyW') || keys.has('ArrowUp');
    input.down = keys.has('KeyS') || keys.has('ArrowDown');
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.repeat) return;
    keys.add(e.code);
    if (e.code === 'Enter') input.pressedEnter = true;
    if (e.code === 'KeyR') input.pressedRestart = true;
    sync();
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
    sync();
  });
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    input.clicked = { x, y };
  });

  // The loop consumes one-shot flags so a single press never fires twice.
  input.consumeEnter = () => {
    const v = input.pressedEnter;
    input.pressedEnter = false;
    return v;
  };
  input.consumeRestart = () => {
    const v = input.pressedRestart;
    input.pressedRestart = false;
    return v;
  };
  input.consumeClick = () => {
    const v = input.clicked;
    input.clicked = null;
    return v;
  };
  return input;
}
