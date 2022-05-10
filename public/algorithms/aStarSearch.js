
/* A* Search Algorithm */
export function aStartSearch(grid, source, target) {
  preprocess(grid, target);
  const visitedNodesInOrder = [];
  source.distance = 0;
  source.heuristic = computeHeuristic(source, target);
  const unvisitedNodes = getAllNodes(grid);
  while (!!unvisitedNodes.length) {
    sortNodesByFValue(unvisitedNodes);
    const current = unvisitedNodes.shift();
    // If we encounter a wall, we skip it.
    if (current.isWall) continue;
    current.isVisited = true;
    visitedNodesInOrder.push(current);
    if (current === target) return visitedNodesInOrder;
    updateUnvisitedNeighbors(grid, current, target);
  }
  return visitedNodesInOrder;
}

function preprocess(grid, target) {
  for (let row of grid) {
    for (let node of row) {
      if (node.isWall) continue;
      node.heuristic = computeHeuristic(node, target);
    }
  }
}

function computeHeuristic(source, target) {
  return Math.abs(source.row - target.row) + Math.abs(source.col - target.col);
}

function sortNodesByFValue(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => {
    const FA = nodeA.distance + nodeA.heuristic;
    const FB = nodeB.distance + nodeB.heuristic;
    return (FA - FB) || (nodeA.heuristic - nodeB.heuristic);
  })
}

function updateUnvisitedNeighbors(grid, node, target) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    const oldFValue = neighbor.distance + neighbor.heuristic;
    const newFValue = neighbor.distance + neighbor.heuristic + 1;
    if (neighbor.distance === Infinity || oldFValue > newFValue) {
      neighbor.prevNode = node;
      neighbor.distance = node.distance + 1;
    }
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

/* Backtracks from the finishNode to find the shortest path.
   Must be called *after* the aStarSearch method above. */
export function getShortestPath(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.prevNode;
  }
  return nodesInShortestPathOrder;
}