/* Depth-first Search */
export function depthFirstSearch(grid, source, target) {
  const visitedNodesInOrder = [];
  const stack = [];
  stack.push(source);
  while (!!stack.length) {
    const current = stack.pop();
    // If we encounter a wall, we skip it.
    if (current.isWall) continue;
    current.isVisited = true;
    visitedNodesInOrder.push(current);
    if (current === target) return visitedNodesInOrder;
    pushNeighborsRandomlyToStack(grid, stack, current);
  }
  return visitedNodesInOrder;
}

function pushNeighborsRandomlyToStack(grid, stack, node) {
  const unvisitedNeighbors = getUnvisitedNeighbors(grid, node);
  while (!!unvisitedNeighbors.length) {
    const randomIndex = randomRange(0, unvisitedNeighbors.length);
    const [randomNeighbor] = unvisitedNeighbors.splice(randomIndex, 1);
    randomNeighbor.prevNode = node;
    stack.push(randomNeighbor);
  }
}

function getUnvisitedNeighbors(grid, node) {
  let neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/* Backtracks from the finishNode to find the shortest path.
   Must be called *after* the depthFirstMethod method above. */
export function getPath(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.prevNode;
  }
  return nodesInShortestPathOrder;
}