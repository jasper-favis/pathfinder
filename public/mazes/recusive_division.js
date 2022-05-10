/* row = y = height 
   col = x = width */

export function recursiveDivision({ grid, row, col, width, height }) {
  const orientation = selectOrientation(width, height);
  const perimeterWall = buildWallPerimeter(grid, width, height);
  const newR = row + 1;
  const newC = col + 1;
  const newW = width - 2;
  const newH = height - 2;
  const innerWalls = divide({ grid, row: newR, col: newC, width: newW, height: newH, orientation });
  const maze = perimeterWall.concat(innerWalls);
  return maze;
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
  let maze = [];

  if (width <= 3 || height <= 3) {
    return maze;
  }

  /* Get random wall location */
  const wall = getRandomWallLocation(grid, row, col, width, height, isHorizontal);
  /* Get random passage through wall. */
  const passageCol = isHorizontal ? randomRange(wall.col, wall.col + width - 1) : wall.col;
  const passageRow = isHorizontal ? wall.row : randomRange(wall.row, wall.row + height - 1);
  const wallLength = isHorizontal ? width : height;

  /* Set increment value for each coordinate. This determines direction of wall. */
  let incrementCol = isHorizontal ? 1 : 0;
  let incrementRow = isHorizontal ? 0 : 1;
  let temp = { ...wall };

  /* Create wall. */
  for (let i = 0; i < wallLength; i++) {
    const { isSource, isTarget } = grid[temp.row][temp.col];
    const isPassage = (temp.row === passageRow) && (temp.col === passageCol);
    const isSpotValid = !isPassage && !isSource && !isTarget;
    grid[temp.row][temp.col].isWall = isSpotValid;
    if (isSpotValid) {
      maze.push(grid[temp.row][temp.col]);
    }

    temp.row += incrementRow;
    temp.col += incrementCol;
  }

  /* Calculate bounds for section left/top of the wall */
  let newR = row;
  let newC = col;
  let newW = isHorizontal ? width : wall.col - col;
  let newH = isHorizontal ? wall.row - row : height;
  let newO = selectOrientation(newW, newH);
  const subMaze1 = divide({ grid, row: newR, col: newC, width: newW, height: newH, orientation: newO });

  /* Calculate bounds for section right/bottom of the wall */
  newR = isHorizontal ? wall.row + 1 : wall.row;
  newC = isHorizontal ? wall.col : wall.col + 1;
  newW = isHorizontal ? width : col + width - wall.col - 1;
  newH = isHorizontal ? row + height - wall.row - 1 : height;
  newO = selectOrientation(newW, newH);
  const subMaze2 = divide({ grid, row: newR, col: newC, width: newW, height: newH, orientation: newO });

  return maze.concat(subMaze1).concat(subMaze2);;
}

/* Get bisecting wall orientation. True indicates horizontal orientation. */
function selectOrientation(width, height) {
  if (width < height) { return true; }
  if (height < width) { return false; }
  return randomTrueOrFalse
}

function getRandomWallLocation(grid, row, col, width, height, isHorizontal) {
  const validWallLocations = getValidWallLocations(grid, row, col, width, height, isHorizontal);
  const i = randomRange(0, validWallLocations.length - 1);
  return validWallLocations[i];
}

function getValidWallLocations(grid, row, col, width, height, isHorizontal) {
  const validWallLocations = [];
  const edgelength = isHorizontal ? height : width;
  const wallLength = isHorizontal ? width : height;
  const offsetRow = isHorizontal ? 0 : wallLength - 1;
  const offsetCol = isHorizontal ? wallLength - 1 : 0;
  const origin = { row, col };
  const wallStart = { row, col };
  const wallEnd = { row: row + offsetRow, col: col + offsetCol };
  let incrementCol = isHorizontal ? 0 : 1;
  let incrementRow = isHorizontal ? 1 : 0;

  for (let i = 0; i < edgelength; i++) {
    if (isValidLocation(grid, wallStart, wallEnd, width, height, isHorizontal, origin))
      validWallLocations.push({ row: wallStart.row, col: wallStart.col });
    wallStart.row += incrementRow;
    wallStart.col += incrementCol;
    wallEnd.row += incrementRow;
    wallEnd.col += incrementCol
  }
  return validWallLocations;
}

/* First check if wall is blocking passage way. Then check if wall is alongside either edge. */
function isValidLocation(grid, start, end, width, height, isHorizontal, origin) {
  const edgeStartRow = isHorizontal ? start.row : start.row - 1;
  const edgeStartCol = isHorizontal ? start.col - 1 : start.col;
  const edgeEndRow = isHorizontal ? end.row : end.row + 1;
  const edgeEndCol = isHorizontal ? end.col + 1 : end.col;
  const startEdgeIsWall = grid[edgeStartRow][edgeStartCol].isWall;
  const endEdgeIsWall = grid[edgeEndRow][edgeEndCol].isWall;

  const edgeRow = isHorizontal ? height : origin.row;
  const edgeCol = isHorizontal ? origin.col : width;
  const isWallAlongFirstEdge = (start.row === origin.row) && (start.col === origin.col);
  const isWallAlongSecondEdge = (start.row === edgeRow) && (start.col === edgeCol);

  return startEdgeIsWall && endEdgeIsWall && !isWallAlongFirstEdge && !isWallAlongSecondEdge;
}

function randomTrueOrFalse() {
  return (Math.random() >= 0.5) ? true : false;
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function buildWallPerimeter(grid, width, height) {
  /* Top, Right, Bottom, Left */
  let perimeterWall = [];
  for (let i = 0; i < width; i++) {
    grid[0][i].isWall = true;
    perimeterWall.push(grid[0][i]);
  }
  for (let i = 0; i < height; i++) {
    grid[i][width - 1].isWall = true;
    perimeterWall.push(grid[i][width - 1]);
  }
  for (let i = width - 1; i >= 0; i--) {
    grid[height - 1][i].isWall = true;
    perimeterWall.push(grid[height - 1][i]);
  }
  for (let i = height - 1; i >= 0; i--) {
    grid[i][0].isWall = true;
    perimeterWall.push(grid[i][0]);
  }
  return perimeterWall;
}

// FOR DEBUGGING PURPOSES
function format(row, col) {
  return `(${row}, ${col})`;
}