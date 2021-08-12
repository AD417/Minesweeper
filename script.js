let mineGrid; 
let gameHasEnded = false;
let gridRows = 10;
let gridCols = 10;
let unflaggedMines = 10;

class Tile {
    constructor (data) { // Data contains x, y, and isMine. 
        this.x = data.x;
        this.y = data.y;
        this.isMine = data.isMine;
        this.isFlagged = false;
        this.uncovered = false;
    }
}

class MineArray {
    constructor (data) { // Data contains rows, cols, and minesTotal
        this.rows = data.rows;
        this.cols = data.cols;
        this.minesTotal = data.minesTotal;

        this.minesLeft = data.minesTotal; // The number of mines that have yet to be uncovered.
        this.tilesLeft = this.rows * this.cols; // The number of tiles in the board. May be used for "mine-free tiles remaining".

        this.tileData = [];

        let minesToGenerate = data.minesTotal;
        let tilesToGenerate = this.rows * this.cols;
        let isMine = false;
        for (let i = 0; i < data.rows; i++) {
            this.tileData[i] = [];
            for (let j = 0; j < data.cols; j++) {
                isMine = (Math.random() < minesToGenerate / tilesToGenerate);
                this.tileData[i][j] = new Tile({ // Generates a tile at a specific cordinate that may or may not have a mine. 
                    x: i,
                    y: j,
                    isMine: isMine,
                })
                tilesToGenerate--;
                if (isMine) minesToGenerate--;
            }
        }
    }
    
    isMine(x, y) { // Tell if a tile contains a mine. 
        return (x >= 0 &&  // These prechecks make sure that the tile being tested is actually a tile. This prevents errors. 
            y >= 0 && 
            x < this.rows && 
            y < this.cols && 
            this.tileData[x][y].isMine
        );
    }

    isFlagged(x, y) { // Tell if a tile is flagged.
        return (x >= 0 && 
            y >= 0 && 
            x < this.rows && 
            y < this.cols && 
            this.tileData[x][y].isFlagged
        );
    }

    minesNear(x, y) { // Tell all the mines near a specific tile. 
        let xInt = parseInt(x);
        let yInt = parseInt(y);
        let nearbyMines = 0;
        if (this.isMine(xInt+1, yInt+1)) nearbyMines++; // Love to know if there's a better way to do this. 
        if (this.isMine(xInt+1, yInt  )) nearbyMines++;
        if (this.isMine(xInt+1, yInt-1)) nearbyMines++;

        if (this.isMine(xInt-1, yInt+1)) nearbyMines++;
        if (this.isMine(xInt-1, yInt  )) nearbyMines++;
        if (this.isMine(xInt-1, yInt-1)) nearbyMines++;

        if (this.isMine(xInt  , yInt+1)) nearbyMines++;
        if (this.isMine(xInt  , yInt-1)) nearbyMines++;

        return nearbyMines;
    }

    flagsNear(x, y) {
        let xInt = parseInt(x);
        let yInt = parseInt(y);
        let nearbyFlags = 0;
        if (this.isFlagged(xInt+1, yInt+1)) nearbyFlags++;
        if (this.isFlagged(xInt+1, yInt  )) nearbyFlags++;
        if (this.isFlagged(xInt+1, yInt-1)) nearbyFlags++;

        if (this.isFlagged(xInt-1, yInt+1)) nearbyFlags++;
        if (this.isFlagged(xInt-1, yInt  )) nearbyFlags++;
        if (this.isFlagged(xInt-1, yInt-1)) nearbyFlags++;

        if (this.isFlagged(xInt  , yInt+1)) nearbyFlags++;
        if (this.isFlagged(xInt  , yInt-1)) nearbyFlags++;

        return nearbyFlags;
    }

    isFullyFlagged(x, y) {
        return (this.flagsNear(x,y) === this.minesNear(x,y) && this.minesNear(x,y) !== 0);
    }

    HTMLForTile(x, y) {
        if (gameHasEnded && this.isMine(x, y)) {
            return `<div 
            id="tile-${x}-${y}" 
            class="tile uncovered">
            X</div>`
        }
        if (this.isMine(x, y)) {
            return `<div 
            id="tile-${x}-${y}" 
            class="tile covered"
            onclick="endGame()"
            oncontextmenu="flagTile(${x},${y})">X
            </div>`
        }
        return `<div 
        id="tile-${x}-${y}" 
        class="tile covered"
        onclick="uncoverTile(${x},${y})"
        oncontextmenu="flagTile(${x},${y})">
        ${this.minesNear(x,y)   }</div>`
    }
}





function generateGridFromInput() {// Takes the input data and creates a milefield. 
    try {
    generateGrid(
        document.getElementById("cols").value,
        document.getElementById("rows").value,
        document.getElementById("mines").value,
    );
    } catch (e) {
        console.log(e)
        alert(e.message);
    }
}

function generateGrid(cols, rows, mines) { // Function that generates a 2D minesweeper board given rows, columns, and mines. 
    gameHasEnded = false
    if (mines > cols * rows) {
        alert("Error: you are trying to generate a minefield with more mines than the field can contain.");
        return;
    }
    mineGrid = new MineArray({
        rows: rows,
        cols: cols,
        minesTotal: mines,
    })



    displayGrid(mineGrid);
}

function displayGrid(matrix) {
    document.getElementById("array").innerHTML = "";
    let string = "";
    //let vars = document.querySelector(':root')
    //vars.style.setProperty("--tilesWidth", 30 * matrix.length)
    for (let i in matrix.tileData) {
        string += `<div id="row-${i}" class="mine-row">`
        for (let j in matrix.tileData[i]) {
            string += matrix.HTMLForTile(i,j)
        }
        string += "</div>";
    }
    document.getElementById("array").innerHTML = string;
    [...document.querySelectorAll(".tile")].forEach( el => 
        el.addEventListener('contextmenu', e => e.preventDefault())
    );
}

function uncoverTile(x, y, auto = false) { // Uncovers a tile.
    if (gameHasEnded || x >= mineGrid.rows || x < 0 || y >= mineGrid.cols || y < 0) return false;

    let tileData = mineGrid.tileData[x][y];
    if (tileData.isFlagged) return false;

    if (tileData.uncovered) {
        if (!auto && mineGrid.isFullyFlagged(x,y)) {
            uncoverTile(x+1, y+1, true);
            uncoverTile(x+1, y  , true);
            uncoverTile(x+1, y-1, true);
            
            uncoverTile(x-1, y+1, true);
            uncoverTile(x-1, y  , true);
            uncoverTile(x-1, y-1, true);
            
            uncoverTile(x, y+1, true);
            uncoverTile(x, y-1, true);

        } else return false;
    }

    if (tileData.isMine) {
        endGame();
        return false;
    }
    tileData.uncovered = true;

    
    let tile = document.getElementById(`tile-${x}-${y}`).classList;
    tile.add("uncovered");
    tile.remove("covered");

    if (mineGrid.minesNear(x, y) === 0) {
        tile.add("no-mines");

        uncoverTile(x+1, y+1, true);
        uncoverTile(x+1, y  , true);
        uncoverTile(x+1, y-1, true);
        
        uncoverTile(x-1, y+1, true);
        uncoverTile(x-1, y  , true);
        uncoverTile(x-1, y-1, true);
        
        uncoverTile(x, y+1, true);
        uncoverTile(x, y-1, true);

    }
    return false;
}

function flagTile(x,y) { // Flags or unflags a tile. 
    if (gameHasEnded) return false; // Game over.

    let tileData = mineGrid.tileData[x][y];
    if (tileData.uncovered) return false; // Can't flag an uncovered tile.

    let tileEl = document.getElementById(`tile-${x}-${y}`);

    if (tileData.isFlagged) {
        tileEl.classList.remove("flagged");
        tileEl.innerHTML = mineGrid.minesNear(x,y);
        tileData.isFlagged = false;
    } else {
        tileEl.classList.add("flagged");
        tileEl.innerHTML = "&#128681"; // 🚩 <-- Goal
        tileData.isFlagged = true;
    }
    return false;
}

function getTileData(x, y) {
    return mineGrid.tileData[x][y]; // Depreciated. 
}



function RandBetween(min, max, isInt = true) { // A function that creates a random integer between the min (inclusive) and max (exclusive). 
    let number =  Math.random() * (max-min) + min;
    if (isInt) return Math.floor(number); // isInt = should the number that is returned be an integer? 
    return number;
}

function endGame() {
    gameHasEnded = true;
    let element;
    for (i in mineGrid.tileData) {
        for (j in mineGrid.tileData[i]) {
            if (!mineGrid.tileData[i][j].isMine) continue;
            element = document.getElementById(`tile-${i}-${j}`);
            if (!mineGrid.tileData[i][j].isFlagged) element.classList.add("mine");
            element.classList.remove("covered");
            element.innerHTML = "&#128163;"; // 💣 <-- Goal
        }
    }
}