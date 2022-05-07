/* row = y = height 
   col = x = width */

export function recursiveDivision({ grid, row, col, width, height }) {
  const orientation = selectOrientation(width, height);
  let maze = [];
  maze = buildWallPerimeter(grid, width, height);
  return maze;
  // divide({ grid, row, col, width, height, orientation });
}

/* Get bisecting wall orientation. True indicates horizontal orientation. */
function selectOrientation(width, height) {
  if (width < height) { return true; }
  if (height < width) { return false; }
  return randomTrueOrFalse
}

function divide(options) {
  const {
    grid,
    row,
    col,
    width,
    height,
    orientation
  } = options;
  const isHorizontal = orientation;

  if (width <= 3 || height <= 3) return;

  /* Designate random coordinates for wall.
     Offsets in randomRange() prevent wall creation on boundary edges. */
  const wallCol = isHorizontal ? col : randomRange(col + 1, col + width - 2);
  const wallRow = isHorizontal ? randomRange(row + 1, row + height - 2) : row;

  /* Designate random passage through wall. */
  const passageCol = isHorizontal ? randomRange(col, col + width - 1) : wallCol;
  const passageRow = isHorizontal ? wallRow : randomRange(row, row + height - 1);

  /* Wall length */
  const len = isHorizontal ? width : height;

  /* Set increment value for each coordinate. This determines direction of wall. */
  let incCol = isHorizontal ? 1 : 0;
  let incRow = isHorizontal ? 0 : 1;

  /* Update Grid */
  /* Set isWall to true for nodes along the wall. 
     Wall starts at grid[wallRow][wallCol].
     If wall is horizontal, increment wallCol until width is reached.
     else, increment wallRow until height is reached.
     Skip passage, source, and target nodes. */
  while (len) {
    const node = grid[wallRow][wallCol];
  }

  /* Calculate bounds for section left/top of the wall */
  let newC = col;
  let newR = row;
  let newW = isHorizontal ? width : wallCol - col + 1;
  let newH = isHorizontal ? wallRow - row + 1 : height;
  let newO = selectOrientation(newW, newH);
  divide({ col: newC, row: newR, width: newW, height: newH, orientation: newO });

  /* Calculate bounds for section right/bottom of the wall */
  newC = isHorizontal ? wallCol : wallCol + 1;
  newR = isHorizontal ? wallRow + 1 : wallRow;
  newW = isHorizontal ? width : wallCol - col + 1;
  newH = isHorizontal ? wallRow - row + 1 : height;
  newO = selectOrientation(newW, newH);
  divide({ col: newC, row: newR, width: newW, height: newH, orientation: newO });
}

function randomTrueOrFalse() {
  return (Math.random() >= 0.5) ? true : false;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function buildWallPerimeter(grid, width, height) {
  let perimeterWall = [];

  /* Top edge. */
  for (let i = 0; i < width; i++) {
    grid[0][i].isWall = true;
    perimeterWall.push(grid[0][i]);
  }
  /* Right edge. */
  for (let i = 0; i < height; i++) {
    grid[i][width - 1].isWall = true;
    perimeterWall.push(grid[i][width - 1]);
  }
  /* Bottom edge. */
  for (let i = 0; i < width; i++) {
    grid[height - 1][i].isWall = true;
    perimeterWall.push(grid[height - 1][i]);
  }
  /* Left edge. */
  for (let i = 0; i < height; i++) {
    grid[i][0].isWall = true;
    perimeterWall.push(grid[i][0]);
  }

  return perimeterWall;
}