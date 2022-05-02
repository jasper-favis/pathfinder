import { dijkstra, getDijkstraPath } from "./dijkstra.js";

const ROW_SIZE = 15;
const COL_SIZE = 50;
const NODE_SIZE = 25;
const gridStyle = {
  "grid-template-rows": `repeat(${ROW_SIZE}, ${NODE_SIZE}px)`,
  "grid-template-columns": `repeat(${COL_SIZE}, ${NODE_SIZE}px)`
};
const nodeStyle = {
  "width": `${NODE_SIZE}px`,
  "height": `${NODE_SIZE}px`
}
let grid = [];
let source = { row: Math.floor(ROW_SIZE / 2), col: Math.floor(COL_SIZE * 0.25) };
let target = { row: Math.floor(ROW_SIZE / 2), col: Math.floor(COL_SIZE * 0.75) };

function displayGrid() {
  $(".grid").css(gridStyle);
  $(".node").css(nodeStyle);

  if (grid && grid.length > 0) {
    grid.map(row => {
      if (row && row.length > 0) {
        row.map(node => {
          if (node) {
            $(".grid").append(displayNode(node));
          }
        });
      }
    });
  }
}

/* Generate a div for the given node.
   Source, target, and wall nodes are distinguished by their
   css class. Every node has an id based on their grid location. */
function displayNode(node) {
  const { row, col, isSource, isTarget } = node;
  const extraClassName = isSource
    ? "node-source"
    : isTarget
      ? "node-target"
      : "";
  const div = `
    <div
      id='node-${row}-${col}'
      class='node ${extraClassName}'
    ></div>
  `;
  return div;
}

/* Use css to visualize the exploration done by path-finding algorithm. 
   Iterate through the visisted nodes and change their css class names 
   to "node node-visited". */
function animateExploration(visitedNodesInOrder, nodesInShortestPathOrder) {
  for (let i = 0; i < visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length - 1) {
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder);
      }, 10 * i);
      return;
    }
    setTimeout(() => {
      const node = visitedNodesInOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-visited';
    }, 10 * i);
  }
}

function animateShortestPath(nodesInShortestPathOrder) {
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    setTimeout(() => {
      const node = nodesInShortestPathOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-shortest-path';
    }, 50 * i);
  }
}

function createGrid() {
  for (let row = 0; row < ROW_SIZE; row++) {
    const currRow = [];
    for (let col = 0; col < COL_SIZE; col++) {
      currRow.push(createNode(row, col));
    }
    grid.push(currRow);
  }
  return grid;
}

function createNode(row, col) {
  const node = {
    row,
    col,
    distance: Infinity,
    isSource: (row === source.row && col === source.col),
    isTarget: (row === target.row && col === target.col),
    isVisited: false,
    isWall: false,
    prevNode: null
  }
  return node;
}

$(".activate-button").click(function (event) {
  activateDijkstra();
});

function activateDijkstra() {
  const start = grid[source.row][source.col];
  const finish = grid[target.row][target.col];
  const visitedNodesInOrder = dijkstra(grid, start, finish);
  const nodesInShortestPathOrder = getDijkstraPath(finish);
  animateExploration(visitedNodesInOrder, nodesInShortestPathOrder);
}

function setup() {
  grid = createGrid();
  displayGrid();
}

$(document).ready(() => {
  setup();
});