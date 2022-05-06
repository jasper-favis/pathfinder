import { dijkstra, getDijkstraPath } from "./dijkstra.js";


const ROW_SIZE = 25;
const COL_SIZE = 50;
const NODE_SIZE = 25;
const INNER_PAGE_WIDTH = NODE_SIZE * COL_SIZE;
const gridStyle = {
  "grid-template-rows": `repeat(${ROW_SIZE}, ${NODE_SIZE}px)`,
  "grid-template-columns": `repeat(${COL_SIZE}, ${NODE_SIZE}px)`
};
const nodeStyle = {
  "width": `${NODE_SIZE}px`,
  "height": `${NODE_SIZE}px`
}
const speedMapping = {
  "0.5x": 1 / 0.5,
  "1x": 1,
  "2x": 1 / 2,
  "4x": 1 / 4
}
let grid = [];
let source = { row: Math.floor(ROW_SIZE / 2), col: Math.floor(COL_SIZE * 0.25) };
let target = { row: Math.floor(ROW_SIZE / 2), col: Math.floor(COL_SIZE * 0.75) };
let mouseIsPressed = false;
let isAnimationInProgress = false;
let draggedNode;
let speed = 1;

$(document).ready(() => {
  setupGrid();
  setupNav();
  setupControls();
});

function setupGrid() {
  grid = createGrid();
  displayGrid();
}

function setupNav() {
  $("nav").css("width", `${INNER_PAGE_WIDTH}px`);
}

function setupControls() {
  $(".controls-container").css("width", `${INNER_PAGE_WIDTH}px`);
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
            $(".grid").append(displayNode("<div></div>", node));
          }
        });
      }
    });
  }
}

/* Nodes are distinguished by their id and css class. */
function displayNode(id, node) {
  const { row, col, isSource, isTarget, isWall } = node;
  const extraClassName = isSource
    ? "node-source"
    : isTarget
      ? "node-target"
      : isWall
        ? "node-wall"
        : "";

  const div = $(id)
    .attr("id", `node-${row}-${col}`)
    .attr("class", "node " + extraClassName)
    .attr("draggable", `${isSource || isTarget}`)
    .mousedown((event) => handleMouseDown(event, row, col))
    .mouseenter((event) => handleMouseEnter(event, row, col))
    .mouseup((event) => handleMouseUp(event, row, col))

  if (isSource || isTarget) {
    div
      .on("dragstart", (event) => handleDragStart(event, row, col));
  } else {
    div
      .on("dragstart", () => false)
      .on("dragover", (event) => handleDragOver(event))
      .on("drop", (event) => handleDrop(event, row, col))
  }
  return div;
}

$(".start-button").click(function (event) {
  if (isAnimationInProgress) return;
  activateDijkstra();
});

function activateDijkstra() {
  const start = grid[source.row][source.col];
  const finish = grid[target.row][target.col];
  const visitedNodesInOrder = dijkstra(grid, start, finish);
  const nodesInShortestPathOrder = getDijkstraPath(finish);
  animateExploration(visitedNodesInOrder, nodesInShortestPathOrder, speed);
}

function animateExploration(visitedNodesInOrder, nodesInShortestPathOrder, speed) {
  disableStartButton(true);
  clearAnimations();
  visitedNodesInOrder.forEach(function (node, i) {
    if (i === visitedNodesInOrder.length - 1) {
      setTimeout(() => {
        animateShortestPath(nodesInShortestPathOrder, speed);
      }, speed * 10 * i);
      return;
    }
    setTimeout(() => {
      if (node.isSource || node.isTarget) return;
      $(`#node-${node.row}-${node.col}`).addClass("node-visited");
    }, speed * 10 * i);
  })
}

function animateShortestPath(nodesInShortestPathOrder, speed) {
  nodesInShortestPathOrder.forEach(function (node, i) {
    setTimeout(() => {
      if (node.isSource || node.isTarget) return;
      $(`#node-${node.row}-${node.col}`).addClass("node-shortest-path");
      const isDisabled = !(i === nodesInShortestPathOrder.length - 2);
      disableStartButton(isDisabled);
    }, speed * 50 * i);
  })
}

function disableStartButton(isDisabled) {
  isAnimationInProgress = isDisabled;
  const val = isDisabled ? "100%" : "0";
  $(".start-button").css("filter", "grayscale(" + val + ")");
}

function clearAllTimeouts() {
  var id = window.setTimeout(function () { }, 0);
  while (id--) { window.clearTimeout(id); }
}

function handleMouseDown(event, row, col) {
  const node = grid[row][col];
  if (node.isSource || node.isTarget) return;
  toggleWall(grid, row, col);
  mouseIsPressed = true;
}

function handleMouseEnter(event, row, col) {
  const node = grid[row][col];
  if (node.isSource || node.isTarget) return;
  if (mouseIsPressed) { toggleWall(grid, row, col); }
}

function handleMouseUp(event) {
  mouseIsPressed = false;
}

function handleMouseLeave() {
  mouseIsPressed = false;
}

function handleDragStart(event, row, col) {
  draggedNode = grid[row][col];
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event, row, col) {
  const nodeDraggedTo = grid[row][col];
  if (draggedNode == null || nodeDraggedTo == null) return;
  event.preventDefault();
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
  if (nodeA == null || nodeB == null) return;
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

  const idA = `#node-${nodeA.row}-${nodeA.col}`;
  const idB = `#node-${nodeB.row}-${nodeB.col}`;

  displayNode(idA, grid[nodeA.row][nodeA.col]);
  displayNode(idB, grid[nodeB.row][nodeB.col]);

  const className = isSource ? "node node-source" : "node node-target";
  $(idB).removeClass().addClass(className);
  $(idA).removeClass().addClass("node");
}

$(".reset-button").click(function (event) {
  disableStartButton(false);
  grid = [];
  clearAllTimeouts();
  clearGrid();
  setupGrid();
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

$(".speed-button").click(function () {
  $(".speed-list").toggleClass("displayBlock");
})

$(".speed-list>li").click(function (event) {
  const speedText = $(this).text();
  $(".speed-button>p").text(speedText);
  speed = speedMapping[speedText];
})

$(".algorithm-button").click(function () {
  $(this).toggleClass("nav-button-bg-color");
  $(".algorithms-list").toggleClass("displayFlex");
})

/* Detect click outside dropdown menu buttons to close menus. */
$(document).click(function (event) {
  const target = $(event.target);
  if (!target.closest(".algorithm-button").length) {
    $(".algorithms-list").removeClass("displayFlex")
    $(".algorithm-button").removeClass("nav-button-bg-color");
  }
});