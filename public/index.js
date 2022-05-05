import { dijkstra, getDijkstraPath } from "./dijkstra.js";


const ROW_SIZE = 25;
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
let mouseIsPressed = false;
let draggedNode;

$(document).ready(() => {
  setup();
});

function setup() {
  grid = createGrid();
  displayGrid();
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

function displayGrid() {
  $(".grid").css(gridStyle).mouseleave(() => handleMouseLeave());
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

/* Create a div for the given node. Source, target, and wall nodes 
   are distinguished by their css class. */
function displayNode(node) {
  const { row, col, isSource, isTarget, isWall } = node;
  const extraClassName = isSource
    ? "node-source"
    : isTarget
      ? "node-target"
      : isWall
        ? "node-wall"
        : "";

  const div = $(`<div></div>`)
    .attr("id", `node-${row}-${col}`)
    .attr("class", "node " + extraClassName)
    .attr("draggable", `${isSource || isTarget}`)
    .mousedown(() => handleMouseDown(row, col))
    .mouseenter(() => handleMouseEnter(row, col))
    .mouseup(() => handleMouseUp(row, col))

  if (isSource || isTarget) {
    div
      .on("dragstart", (event) => handleDragStart(event, row, col));
  } else {
    div
      .on("dragover", (event) => event.preventDefault())
      .on("drop", (event) => handleDrop(event, row, col))
  }
  return div;
}

$(".start-button").click(function (event) {
  activateDijkstra();
});

function activateDijkstra() {
  const start = grid[source.row][source.col];
  const finish = grid[target.row][target.col];
  const visitedNodesInOrder = dijkstra(grid, start, finish);
  const nodesInShortestPathOrder = getDijkstraPath(finish);
  animateExploration(visitedNodesInOrder, nodesInShortestPathOrder);
}

/* Iterate through the visisted nodes and change their css class names 
   to "node node-visited". */
function animateExploration(visitedNodesInOrder, nodesInShortestPathOrder) {
  clearAnimations();
  for (let i = 0; i < visitedNodesInOrder.length; i++) {
    if (i === visitedNodesInOrder.length - 1) {
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder);
      }, 10 * i);
      return;
    }
    setTimeout(() => {
      const node = visitedNodesInOrder[i];
      if (node.isSource || node.isTarget) return;
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-visited';
    }, 10 * i);
  }
}

function animateShortestPath(nodesInShortestPathOrder) {
  for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
    setTimeout(() => {
      const node = nodesInShortestPathOrder[i];
      if (node.isSource || node.isTarget) return;
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-shortest-path';
    }, 50 * i);
  }
}

function clearAllTimeouts() {
  var id = window.setTimeout(function () { }, 0);
  while (id--) { window.clearTimeout(id); }
}

function handleMouseDown(row, col) {
  const node = grid[row][col];
  if (node.isSource || node.isTarget) return;
  toggleWall(grid, row, col);
  mouseIsPressed = true;
}

function handleMouseEnter(row, col) {
  const node = grid[row][col];
  if (node.isSource || node.isTarget) return;
  if (mouseIsPressed) { toggleWall(grid, row, col); }
}

function handleMouseUp() {
  mouseIsPressed = false;
}

function handleMouseLeave() {
  mouseIsPressed = false;
}

function handleDragStart(event, row, col) {
  draggedNode = grid[row][col];
}

function handleDrop(event, row, col) {
  event.preventDefault();
  const nodeDraggedTo = grid[row][col];
  swapNodes(draggedNode, nodeDraggedTo);
}

function toggleWall(grid, row, col) {
  const node = grid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  grid[row][col] = newNode;
  const id = `#node-${row}-${col}`;
  const extraClassName = newNode.isWall ? "node-wall" : "";
  $(id).attr("class", "node " + extraClassName);
};

function swapNodes(nodeA, nodeB) {
  grid[nodeA.row][nodeA.col] = {
    ...nodeB,
    row: nodeA.row,
    col: nodeA.col
  }
  grid[nodeB.row][nodeB.col] = {
    ...nodeA,
    row: nodeB.row,
    col: nodeB.col
  };

  const movedNode = grid[nodeB.row][nodeB.col];
  const { row, col, isSource, isTarget } = movedNode;
  source = isSource ? { row, col } : source;
  target = isTarget ? { row, col } : target;

  // const idA = `#node-${nodeA.row}-${nodeA.col}`;
  // const idB = `#node-${nodeB.row}-${nodeB.col}`;
  // $(idA).replaceWith(displayNode(nodeA.row, nodeA.col));
  // $(idB).replaceWith(displayNode(nodeB.row, nodeB.col));
}

$(".reset-button").click(function (event) {
  grid = [];
  clearAllTimeouts();
  clearGrid();
  setup();
});

function clearAnimations() {
  const newGrid = grid.map(currRow => {
    return currRow.map(node => {
      const newNode = createNode(node.row, node.col);
      newNode.isSource = node.isSource;
      newNode.isTarget = node.isTarget;
      newNode.isWall = node.isWall;
      return newNode;
    });
  });
  grid = newGrid;
  clearGrid();
  displayGrid();
}

function clearGrid() {
  $(".grid").empty();
}