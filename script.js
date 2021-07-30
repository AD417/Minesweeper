let mineGrid = []; // Initialize a list with nothing
let gameHasEnded = false;
let gridRows = 10;
let gridCols = 10;
let unflaggedMines = 10;

function generateGridFromInput() {// Takes the input data and creates a milefield. 
    try {
    generateGrid(
        document.getElementById("rows").value,
        document.getElementById("cols").value,
        document.getElementById("mines").value,
    );
    } catch (e) {
        alert(e.message);
    }
}

function generateGrid(cols, rows, mines) { // Function that generates a 2D minesweeper board given rows, columns, and mines. 
    // Declaring stuff
    mineGrid = [];
    gridRows = rows;
    gridCols = cols;
    unflaggedMines = 10;
    let tilesLeft = rows * cols; // A value used for telling how many mines are left, and where to put those mines.
    let minesLeft = mines;

    if (minesLeft > tilesLeft) {
        alert("Error: you are trying to generate a minefield with more mines than the field can contain.");
        return;
    }

    // Part 1: geneating the grid itself. 
    for (let i = 0; i < rows; i++) {
        let gridRow = []; // creates a list that will be one row of the grid. 
        for (let j = 0; j < cols; j++) {
            if (minesLeft / tilesLeft > Math.random()) {
                gridRow[j] = "X"; // X = mine. If the game randomly selects this tile to have a mine, then give it one. 
                minesLeft--;
            } else {
                gridRow[j] = 0; // Else, give it the integer value 0 so it can calculate how many mines border it. 
            }
            tilesLeft--;
        }
        mineGrid[i] = gridRow; // Puts the row that was just generated into the mineGrid. 
    }
    
    // Part 2: iterating through the grid to get mine counts. 
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (mineGrid[i][j] === "X") continue; // Ignore tiles that have mines
            if (i + 1 < rows) { // Try not to get a "element is undefined" error for edge of board. 
                if (mineGrid[i + 1][j + 1] === "X") mineGrid[i][j]++;
                if (mineGrid[i + 1][j    ] === "X") mineGrid[i][j]++;
                if (mineGrid[i + 1][j - 1] === "X") mineGrid[i][j]++;
            }
            if (i > 0) {
                if (mineGrid[i - 1][j + 1] === "X") mineGrid[i][j]++;
                if (mineGrid[i - 1][j    ] === "X") mineGrid[i][j]++;
                if (mineGrid[i - 1][j - 1] === "X") mineGrid[i][j]++;
            }
            if (mineGrid[i][j + 1] === "X") mineGrid[i][j]++;
            if (mineGrid[i][j - 1] === "X") mineGrid[i][j]++;
        }
    } 
    displayGrid(mineGrid);
    gameHasEnded = false
}

function displayGrid(matrix) {
    let string = "";
    for (let i in matrix) {
        string += `<div id="row-${i}" class="mine-row">`
        for (let j in matrix[i]) {
            string += `<div 
                id="tile-${i}-${j}" 
                class="tile covered" 
                onclick="uncoverTile(${i},${j})"
                oncontextmenu="flagTile(${i},${j})">
                ${matrix[i][j]}</div>`;
        }
        string += "</div>";
    }
    document.getElementById("array").innerHTML = string;
    [...document.querySelectorAll(".tile")].forEach( el => 
        el.addEventListener('contextmenu', e => e.preventDefault())
    );
}

function uncoverTile(x, y, auto = false) { // Uncovers a tile.
    let tile = document.getElementById(`tile-${x}-${y}`).classList;
    let tileData = getTileData(x,y)

    if (tile.contains("uncovered") || tile.contains("flagged")) return;
    tile.add("uncovered");
    tile.remove("covered");

    if (tileData === 0) {
        tile.add("no-mines");
        if (x + 1 < gridRows) { // Try not to get a "element is undefined" error for edge of board. 
            if (mineGrid[x + 1][y + 1] !== undefined) uncoverTile(x+1, y+1, true);
            if (mineGrid[x + 1][y    ] !== undefined) uncoverTile(x+1, y  , true);
            if (mineGrid[x + 1][y - 1] !== undefined) uncoverTile(x+1, y-1, true);
        }
        if (x > 0) { 
            if (mineGrid[x - 1][y + 1] !== undefined) uncoverTile(x-1, y+1, true);
            if (mineGrid[x - 1][y    ] !== undefined) uncoverTile(x-1, y  , true);
            if (mineGrid[x - 1][y - 1] !== undefined) uncoverTile(x-1, y-1, true);
        }
        if (mineGrid[x][y + 1] !== undefined) uncoverTile(x, y+1, true);
        if (mineGrid[x][y - 1] !== undefined) uncoverTile(x, y-1, true);

    }
}

function flagTile(x,y) {
    let tile = document.getElementById(`tile-${x}-${y}`).classList;
    if (tile.contains("uncovered")) return;

    if (tile.contains("flagged")) tile.remove("flagged");
    else tile.add("flagged");
    return false;
}

function getTileData(x, y) {
    return mineGrid[x][y];
}



function RandBetween(min, max, isInt = true) { // A function that creates a random integer between the min (inclusive) and max (exclusive). 
    let number =  Math.random() * (max-min) + min;
    if (isInt) return Math.floor(number); // isInt = should the number that is returned be an integer? 
    return number;
}