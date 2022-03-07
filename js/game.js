import { Cell } from "/js/cell.js";
import { UI } from "/js/ui.js";
import { Timer } from "/js/timer.js";
import { ResetButton } from "/js/resetButton.js";
import { Modal } from '/js/modal.js'



class Game extends UI {
    #config = {
        easy: {
            rows: 8,
            cols: 8,
            mines: 10
        },
        normal: {
            rows: 16,
            cols: 16,
            mines: 40
        },
        expert: {
            rows: 16,
            cols: 30,
            mines: 99
        }
    }


    #counter = new Counter();
    #timer = new Timer();
    #isGameFinished = false;
    #numeberOfRows = null;
    #numeberOfCols = null;
    #numeberOfMines = null;
    #modal = new Modal();


    #cells = [];
    #board = null;
    #cellsElements = null;
    #cellsToReveal = 0;
    #revealedCells = 0;


    #buttons = {
        modal: null,
        easy: null,
        normal: null,
        expert: null,
        reset: new ResetButton()
    }


    initialiazeGame() {
        this.#counter.init();
        this.#timer.init();
        this.#handleElements();
        this.#addButtonsEventsListeners();
        this.#newGame();
    }

    #newGame(

        rows = this.#config.easy.rows,
        cols = this.#config.easy.cols,
        mines = this.#config.easy.mines
    ){
        this.#numberOfRows = rows;
        this.#numeberOfCols = cols;
        this.#numeberOfMines = mines;
        this.#counter.setValue(this.#numberOfMines);
        this.#timer.resetTimer();
        this.#cellsToReveal = this.#numberOfCols * this.#numberOfRows - this.#numberOfMines;
        this.#buttons.reset.changeEmotion('neutral');

        this.#isGameFinished = false;
        this.#revealedCells = 0;

        this.#setStyles();

        this.#generateCells();
        this.#renderBoard();
        this.#placeMinesInCells();
        this.#cellsElements = this.getElements(this.UiSelectors.cell);
        this.#addCellsEventListeners()

    }


    #endGame(isWin) {
        this.#isGameFinished = true;
        this.#timer.stopTimer();

        this.#modal.buttonText = 'Close';

        if (!isWin) {
            this.#revealMines()
            this.#modal.infoText = 'You lost, try again!';
            this.#buttons.reset.changeEmotion('negative');
            this.#modal.setText();
            this.#modal.toggleModal();
            return;

        }
    }

    #addCellsEventListeners() {
        this.#cellsElements.forEach(element => {
            element.addEventListener('click', this.#handleCellClick);
            element.addEventListener('contextmenu', this.#handleCellContextMenu);
        })
    }

    #removeCellsEventListeners() {
        this.#cellsElements.forEach(element => {
            element.removeEventListener('click', this.#handleCellClick)
            element.removeEventListener('contextmenu', this.#handleCellContextMenu);
        })
    }

    #addButtonsEventsListeners() {
        this.#buttons.modal.addEventListener('click', this.#modal.toggleModal)
        this.#buttons.easy.addEventListener('click', () => this.#handleNewGameClick(this.#config.easy.rows, this.#config.easy.cols, this.#config.easy.mines));
        this.#buttons.normal.addEventListener('click', () => this.#handleNewGameClick(this.#config.normal.rows, this.#config.normal.cols, this.#config.normal.mines));
        this.#buttons.expert.addEventListener('click', () => this.#handleNewGameClick(this.#config.expert.rows, this.#config.expert.cols, this.#config.expert.mines));
        this.#buttons.reset.element.addEventListener('click', () => this.#handleNewGameClick());
    }

    #handleNewGameClick(rows = this.#numberOfRows, cols = this.#numberOfCols, mines = this.#numberOfMines) {
        this.#removeCellsEventListeners();
        this.#newGame(rows, cols, mines);
    }

    #handleElements() {
        this.#board = this.getElement(this.UiSelectors.board)
        this.#buttons.modal = this.getElement(this.UiSelectors.modalButton);
        this.#buttons.easy = this.getElement(this.UiSelectors.easyButton);
        this.#buttons.normal = this.getElement(this.UiSelectors.normalButton);
        this.#buttons.expert = this.getElement(this.UiSelectors.expertButton);

    }

    #generateCells() {
        this.#cells.length = 0;
        for (let row = 0; row < this.#numeberOfRows; row++) {
            this.#cells[row] = [];
            for (let col = 0; col < this.#numeberOfCols; col++) {
                this.#cells[row].push(new Cell(col, row))
            }
        }
    }

    #renderBoard() {
        while (this.#board.firstChild) {
            this.#board.removeChild(this.#board.lastChild)
        }
        this.#cells.flat().forEach(cell => {
            this.#board.insertAdjacentHTML('beforeend', cell.createElement())
            cell.element = cell.getElement(cell.selector)
        });
    }


    #placeMinesInCells() {
        let minesToPlace = this.#numberOfMines;
        while (minesToPlace) {
            const rowIndex = this.#getRandomIntiger(0, this.#numberOfRows - 1)
            const colIndex = this.#getRandomIntiger(0, this.#numberOfCols - 1)

            const cell = this.#cells[rowIndex][colIndex];

            const hasCellMine = cell.isMine

            if (!hasCellMine) {
                cell.addMine()
                minesToPlace--;
            }
        }
    }




    #handleCellClick = e => {
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'), 10);
        const colIndex = parseInt(target.getAttribute('data-x'), 10);

        //i add this two lines
        const cell = this.#cells[rowIndex][colIndex];
        if (cell.isFlagged || this.#isGameFinished) return;

        this.#clickCell(cell)
    }

    #handleCellContextMenu = e => {
        e.preventDefault();
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'), 10);
        const colIndex = parseInt(target.getAttribute('data-x'), 10);

        const cell = this.#cells[rowIndex][colIndex];
        if (cell.isReveal || this.#isGameFinished) return;

        cell.toggleFlag();
    }

    #setStyles() {

        document.documentElement.style.setProperty("--cells-in-row", this.#numberOfCols);
    }

}


#clickCell(cell){
    if (this.#isGameFinished || cell.isFlagged) return;
    if (cell.isMine) {
        this.#endGame(false);
    } else {
        this.#setCellValue(cell);
    }

    if (this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished) {
        this.#endGame(true);
    }

}



  #revealMines(){
    this.#cells.flat().filter(({ isMine }) => isMine).forEach(cell => cell.revealCell())
}




 #setCellValue(cell){
    let mineCount = 0;
    for (let rowIndex = Math.max(cell.y - 1, 0); rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1); rowIndex++) {
        for (let colIndex = Math.max(cell.x - 1, 0); colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1); colIndex++) {
            if (this.#cells[rowIndex][colIndex].isMine) {
                mineCount++;
            }
        }
    }

    cell.value = mineCount;
    cell.revealCell();

    this.#revealedCells++;

    if (!cell.value) {
        for (let rowIndex = Math.max(cell.y - 1, 0); rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1); rowIndex++) {
            for (let colIndex = Math.max(cell.x - 1, 0); colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1); colIndex++) {
                const cell = this.#cells[rowIndex][colIndex];
                if (!cell.isReveal) {
                    this.#clickCell(cell);
                }
            }
        }
    }
}




  #setStyles() {
    document.documentElement.style.setProperty("--cells-in-row", this.#numberOfCols);
}

  #getRandomIntiger(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}
}
window.onload = function () {
    const game = new Game();
    game.initialiazeGame();

};