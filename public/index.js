import { aStartSearch, getShortestPath } from "./algorithms/aStarSearch.js";
import { dijkstra, getDijkstraPath } from "./algorithms/dijkstra.js";
import { depthFirstSearch, getPath } from "./depthFirstSearch.js";
import { recursiveDivision } from "./mazes/recusive_division.js";

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
let algorithmName = "Dijkstra's Algorithm";
let mouseIsPressed = false;
let isAnimationInProgress = false;
let draggedNode;
let speed = 1;

$(document).ready(() => {
  setupGrid();
  setupTutorial();
  setupNav();
  setupDescription();
  setupControls();
});

/* Detect click outside dropdown menu buttons to close menus. */
$(document).click(function (event) {
  hideDropdownMenu(event);
});

$(".play-button").click(function (event) {
  if (isAnimationInProgress) return;
  switch (algorithmName) {
    case "A* Search":
      activateAStar();
      break;
    case "Dijkstra's Algorithm":
      activateDijkstra();
      break;
    case "Depth-first Search":
      activateDepthFirstSearch();
      break;
    default:
      activateDijkstra();
  }
});

$(".tutorial-button").click(function (event) {
  $(".tutorial-outer-container").addClass("displayFlex");
})

$(".skip-button").click(function (event) {
  $(".tutorial-outer-container").removeClass("displayFlex");
})

$(".clear-button").click(function (event) {
  resetGrid();
});

$(".speed-button").click(function (event) {
  $(".speed-list").toggleClass("displayBlock");
})

$(".speed-list>li").click(function (event) {
  const speedText = $(this).text();
  $(".speed-button>p").text(speedText);
  speed = speedMapping[speedText];
})

$(".algorithm-button").click(function (event) {
  $(this).toggleClass("nav-button-bg-color");
  $(".algorithms-list").toggleClass("displayFlex");
})

$(".algorithms-list>li").click(function (event) {
  algorithmName = $(this).text();
  $(".algorithm-name").text(algorithmName);
})

$(".maze-button").click(function (event) {
  $(this).toggleClass("nav-button-bg-color");
  $(".maze-list").toggleClass("displayFlex");
})

$("#maze-1").click(function (event) {
  resetSourceAndTarget();
  resetGrid();
  const maze = generateRecursiveDivision();
  animateMaze(maze);
})

function setupGrid() {
  grid = [];
  grid = createGrid();
  displayGrid();
}

function setupTutorial() {
  $(".tutorial-header").text("Pathfinder");
  const greeting = `
    Welcome to Pathfinder! A web application for visualizing pathfinding algorithms.
    <br>
    <br>
    What is a pathfinding algorithm?
    <br>
    A pathfinding algorithm finds a route, in some cases, the shortest route between two points.
    With this application, you'll be able to visualize the different ways these algorithms explore their
    surroundings in search for a target.
  `;
  const imgURL = "./images/path.png";
  $(".tutorial-text").html(greeting);
  $(".tutorial-img").css("background-image", `url('${imgURL}')`);
  $(".tutorial-outer-container").addClass("displayFlex");
}

function setupNav() {
  $("nav").css("width", `${INNER_PAGE_WIDTH}px`);
}

function setupDescription() {
  $(".algorithm-name").text(algorithmName);
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
    heuristic: Infinity,
    isSource: (row === source.row && col === source.col),
    isTarget: (row === target.row && col === target.col),
    isVisited: false,
    isWall: false,
    prevNode: null
  }
  return node;
}

function displayGrid() {
  if (!!grid && grid.length == 0) return;
  $(".grid").css(gridStyle).mouseleave((event) => handleMouseLeave(event));
  $(".node").css(nodeStyle);

  for (let row of grid) {
    for (let node of row) {
      $(".grid").append(displayNode("<div></div>", node));
    }
  }
}

/* Nodes are distinguished by their id and class. */
function displayNode(id, node) {
  const { row, col, isSource, isTarget } = node;
  const extraClassName = isSource
    ? "node-source"
    : isTarget
      ? "node-target"
      : "";

  const div = $(id)
    .attr("id", `node-${row}-${col}`)
    .attr("class", `node ${extraClassName}`)
    .attr("draggable", `${isSource || isTarget}`)
    .on("dragstart", (event) => handleDragStart(event, row, col))
    .on("dragover", (event) => handleDragOver(event))
    .on("drop", (event) => handleDrop(event, row, col))
    .mousedown((event) => handleMouseDown(event, row, col))
    .mouseenter((event) => handleMouseEnter(event, row, col))
    .mouseup((event) => handleMouseUp(event, row, col))
  return div;
}

function activateDijkstra() {
  const start = grid[source.row][source.col];
  const finish = grid[target.row][target.col];
  const visitedNodesInOrder = dijkstra(grid, start, finish);
  const nodesInShortestPathOrder = getDijkstraPath(finish);
  animateExploration(visitedNodesInOrder, nodesInShortestPathOrder, speed);
}

function activateAStar() {
  const start = grid[source.row][source.col];
  const finish = grid[target.row][target.col];
  const visitedNodesInOrder = aStartSearch(grid, start, finish);
  const nodesInShortestPathOrder = getShortestPath(finish);
  animateExploration(visitedNodesInOrder, nodesInShortestPathOrder, speed);
}

function activateDepthFirstSearch() {
  const start = grid[source.row][source.col];
  const finish = grid[target.row][target.col];
  const visitedNodesInOrder = depthFirstSearch(grid, start, finish);
  const nodePath = getPath(finish);
  animateExploration(visitedNodesInOrder, nodePath, speed);
}

function animateExploration(visitedNodesInOrder, nodesInShortestPathOrder, speed) {
  disableStartButton(true);
  clearAnimations();
  visitedNodesInOrder.forEach((node, i) => {
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
  nodesInShortestPathOrder.forEach((node, i) => {
    setTimeout(() => {
      $(`#node-${node.row}-${node.col}`).addClass("node-shortest-path");
      disableStartButton(!(i === nodesInShortestPathOrder.length - 1));
    }, speed * 50 * i);
  })
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

function handleMouseLeave(event) {
  mouseIsPressed = false;
}

function handleDragStart(event, row, col) {
  const node = grid[row][col];
  if (!node.isSource && !node.isTarget) return event.preventDefault();
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
  $(id).attr("class", `node ${extraClassName}`);
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

function resetGrid() {
  disableStartButton(false);
  stopAnimations();
  clearGrid();
  setupGrid();
}

function resetSourceAndTarget() {
  source = { row: Math.floor(ROW_SIZE / 2), col: Math.floor(COL_SIZE * 0.25) };
  target = { row: Math.floor(ROW_SIZE / 2), col: Math.floor(COL_SIZE * 0.75) };
}

function disableStartButton(isDisabled) {
  isAnimationInProgress = isDisabled;
  const val = isDisabled ? "100%" : "0";
  $(".play-button").css("filter", "grayscale(" + val + ")");
}

function clearGrid() {
  $(".grid").empty();
}

function stopAnimations() {
  var id = window.setTimeout(function () { }, 0);
  while (id--) { window.clearTimeout(id); }
}

function clearAnimations() {
  for (let currRow of grid) {
    for (let node of currRow) {
      node.distance = Infinity;
      node.heuristic = Infinity;
      node.isVisited = false;
      node.prevNode = null;
      $(`#node-${node.row}-${node.col}`).removeClass("node-visited");
      $(`#node-${node.row}-${node.col}`).removeClass("node-shortest-path");
    }
  }
}

function animateMaze(maze) {
  disableStartButton(true);
  clearAnimations();
  maze.forEach((node, i) => {
    setTimeout(() => {
      $(`#node-${node.row}-${node.col}`).addClass("node-wall");
      disableStartButton(!(i === maze.length - 1));
    }, 10 * i);
  })
}

function generateRecursiveDivision() {
  const row = 0;
  const col = 0;
  const height = grid.length;
  const width = grid[0].length;
  const maze = recursiveDivision({ grid, row, col, width, height });
  return maze;
}

function hideDropdownMenu(event) {
  const target = $(event.target);
  if (!target.closest(".algorithm-button").length) {
    $(".algorithms-list").removeClass("displayFlex")
    $(".algorithm-button").removeClass("nav-button-bg-color");
  }
  if (!target.closest(".maze-button").length) {
    $(".maze-list").removeClass("displayFlex")
    $(".maze-button").removeClass("nav-button-bg-color");
  }
}