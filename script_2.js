//next Step: click on field to place symbol

class Gameboard {
  constructor(player1, player2, startField) {
    this.field = startField;
    this.players = [player1, player2];
    this.currentPlayer = player1;
    this.winner = "";
    this.turn = 1; //increases at the end of makemove
  }

  moveDialog() {
    const dialogDiv = document.querySelector("#move");
    const moveText = document.querySelector("div#move p");
    const dialogForm = document.querySelector("#input-form");

    dialogForm.reset();

    const dialogFormCopy = dialogForm.cloneNode(true);

    if (this.turn === 1) {
      dialogForm.remove();
      dialogDiv.append(dialogFormCopy);
    }

    // empty input - does not work since copying ...?

    console.log(
      `move Dialog executing ${this.currentPlayer.name}'s moveDialog`
    );

    // show Dialog
    dialogDiv.style.visibility = "visible";
    if (moveText !== null) {
      moveText.innerText = `${this.currentPlayer.name}'s turn:`;
    } else {
      let pElement = document.createElement("p");
      pElement.innerText = `${this.currentPlayer.name}'s turn:`;
      dialogDiv.append(pElement);
    }

    this.moveEvent(dialogFormCopy);
  }

  moveEvent(dialogFormCopy) {
    const currentGameboard = this;

    const initiateMove = function (event) {
      console.log("event is " + event);
      event.preventDefault();
      const data = new FormData(event.target);
      let inputValue = data.get("field");
      console.log("input is " + inputValue);
      console.log(currentGameboard.currentPlayer.name + "in INitiative Move");
      currentGameboard.makeMove(inputValue);
    };

    dialogFormCopy.addEventListener("submit", initiateMove); // remove input totally and renew each time for a new board to dispose of listener?
  }

  makeMove(inputValue) {
    let symbol = this.currentPlayer.symbol;
    //const inputLoc = document.querySelector("div#move input");
    const container = document.querySelector("div#container");

    this.turn++;

    console.log(`make Move executing ${this.currentPlayer.name}'s MOVE`);

    console.log("input Loc is " + inputValue);

    // assign i_loc, j_loc to "0,0" text in input [check for input format including , & not being out of range]
    let [i_loc, _, j_loc] = inputValue;
    i_loc = Number(i_loc);
    j_loc = Number(j_loc);
    //no value passed?

    if (this.field[i_loc][j_loc].textContent !== "") {
      alert("Invalid Move, please repeat");
      this.moveDialog();
    }

    this.field[i_loc][j_loc].textContent = symbol;
    this.showField();

    //move recorded -> now check if draw or win
    //returns true if game can continue, false if not

    // if game is not at the end

    if (this.gameCanContinue(i_loc, j_loc)) {
      // switch currentPlayer
      if (this.currentPlayer === this.players[0]) {
        this.currentPlayer = this.players[1];
        this.moveDialog();
      } else {
        this.currentPlayer = this.players[0];
        this.moveDialog();
      }
    } else {
      const bigMessage = document.createElement("h1");
      bigMessage.innerText = `Player${this.currentPlayer.name} has won`;
      bigMessage.style.color = "red";
      bigMessage.style.border = "1px solid red";
      container.append(bigMessage);

      const dialogDiv = document.querySelector("#move");
      dialogDiv.style.visibility = "hidden";

      this.winner = `${this.currentPlayer.name}`;
      this.currentPlayer.gameWon();

      //initiate new game -> via Setup again ...
    }
  }

  gameCanContinue(i_loc, j_loc) {
    let currentGameboard = this;
    console.log("GameContinue Executing");
    let symbolCount = "";

    const continueCheck = function (currentGameboard, symbolCount) {
      let winCond = currentGameboard.currentPlayer.symbol.repeat(3);
      console.log("win Cond =" + winCond);
      if (symbolCount === winCond) {
        currentGameboard.resetField();
        return false;
      } else {
        return true;
      }
    };

    //Check row of last entry
    let row = this.field[i_loc];
    symbolCount = row.reduce((acc, curr) => acc + curr.textContent, "");
    console.log("row symbol count = " + symbolCount);
    if (continueCheck(currentGameboard, symbolCount) === false) {
      console.log("row won");
      return false;
    }

    // only return smth if win

    //check column of last entry:
    let column = this.field.map((x) => x[j_loc]);
    symbolCount = column.reduce((acc, curr) => acc + curr.textContent, "");
    console.log("column symbol count = " + symbolCount);
    if (continueCheck(currentGameboard, symbolCount) === false) {
      console.log("column won");
      return false;
    }

    //check main diagonal
    if (i_loc === j_loc) {
      let zero = this.field[0][0].textContent;
      let one = this.field[1][1].textContent;
      let two = this.field[2][2].textContent;
      symbolCount = zero + one + two;
      console.log("main diag symbol count = " + symbolCount);
      if (continueCheck(currentGameboard, symbolCount) === false) {
        console.log("main diag won");
        return false;
      }
    }

    //check anti-diagonal
    //if on anti-diag

    let newArray = [];

    let j = 2;
    for (let i = 0; i < this.field.length; i++) {
      newArray.push(this.field[i][j].textContent);
      j -= 1;
    }
    symbolCount = newArray[0] + newArray[1] + newArray[2];
    console.log("anti-diag symbol count = " + symbolCount);
    if (continueCheck(currentGameboard, symbolCount) === false) {
      console.log("anti diag won");
      return false;
    }

    //no win
    console.log("No Win if this is reached");
    return true;
  }

  showField() {
    //rewrite with html field
    const fieldDiv = document.querySelector(".js-field");
    for (let row of this.field) {
      for (let element of row) {
        fieldDiv.append(element);
      }
    }
  }

  resetField() {
    /*
    for (let row of this.field) {
      for (let cell of row) {
        cell.textContent = "";
      }
    }
  }
    */
    const field = document.querySelectorAll("div.js-field div");
    for (let div of field) {
      div.remove();
    }
  }
}

class Player {
  constructor(name, symbol) {
    this.name = name;
    this.symbol = symbol;
    this.wonGames = 0;
  }

  gameWon() {
    this.wonGames++;
  }
}

// GLOBAL CODE
const setupDialog = document.querySelector("dialog#setup");
const setupStartButton = document.querySelector("#setup-button");
const setupCloseButton = document.querySelector("#setup-close");
const startMoveButton = document.querySelector("#start-game");
const gameboards = [];

const fieldCreation = function () {
  const emptyField = [];

  // create empty 3x3 field
  for (let i = 0; i < 3; i++) {
    emptyField.push([]);
    for (let j = 0; j < 3; j++) {
      let square = document.createElement("div");
      square.id = `cell_${i}-${j}`;
      emptyField[i].push(square);
    }
  }
  return emptyField;
};

//to test follow up games
gameboards.push(
  new Gameboard(new Player("a"), new Player("b"), fieldCreation())
);
gameboards[0].winner = "a";

// working fine
const playerSetup = function (e) {
  const messages = [];
  const err = document.querySelector("div#error");
  let player1 = {};
  let player2 = {};
  let player1Name = document.querySelector("input[name='player1']").value;
  let player2Name = document.querySelector("input[name='player2']").value;

  //TODO validation

  if (player1Name === player2Name) {
    messages.push("Error: Name Duplication");

    //Wait for new input
  }

  if (messages.length > 0) {
    e.preventDefault();
    err.textContent = messages.join(", ");
  } else {
    player1 = new Player(player1Name, "X");
    player2 = new Player(player2Name, "O");
    setupDialog.close();
    let startField = fieldCreation();
    gameboards.push(new Gameboard(player1, player2, startField));
  }
};

setupStartButton.addEventListener("click", () => setupDialog.showModal());
setupCloseButton.addEventListener("click", playerSetup);
startMoveButton.addEventListener("click", () => {
  for (let gameboard of gameboards) {
    if (gameboard.winner === "") {
      gameboard.moveDialog(); //erstes noch offenes Board
    }
  }
});

// END GLOBAL Code

/**
 * Button Start setup screen -> on close: setupFunction (create Players + Board)
 * Button Start Move Loop -> loop for as long as no draw or win; afterwards new board (or new players) dep on user input
 *
 */

/**
 * You’ve got a solid start, but there are **several real JavaScript errors plus some logic/DOM mistakes** that will break or misbehave at runtime. I’ll group them by severity and explain **what’s wrong + how to fix it**.

---

## 🔴 Critical runtime errors (code will not work as intended)

### 1. `addEventListener` is called **incorrectly**

```js
moveButton.addEventListener("click", initiateMove(currentGameboard));
```

❌ **Problem**
You are *calling* `initiateMove` immediately instead of passing a function reference.
The return value (`undefined`) is what gets registered as the handler.

✅ **Fix**
Use a function reference or wrap it in an arrow function:

```js
moveButton.addEventListener("click", () => initiateMove(currentGameboard));
```

---

### 2. `removeEventListener()` is invalid

```js
moveButton.removeEventListener();
```

❌ **Problem**
`removeEventListener` **requires the same event type and function reference** used in `addEventListener`.

✅ **Fix**
Store the handler:

```js
const initiateMove = () => {
  currentGameboard.makeMove();
};

moveButton.removeEventListener("click", initiateMove);
moveButton.addEventListener("click", initiateMove);
```

---

### 3. `flag` is an undeclared global inside `moveDialog`

```js
flag = true;
```

❌ **Problem**
This creates (or mutates) a global variable implicitly.
Also, `flag` logic doesn’t actually prevent multiple listeners.

✅ **Fix**
Either:

```js
this.flag = true;
```

or (better) **remove `flag` entirely** and handle listeners correctly.

---

### 4. Invalid DOM append usage

```js
dialogDiv.append(
  (document.createElement("p").innerText =
    `${this.currentPlayer.name}'s turn:`)
);
```

❌ **Problem**
You’re appending a **string**, not an element.

✅ **Fix**

```js
const p = document.createElement("p");
p.innerText = `${this.currentPlayer.name}'s turn:`;
dialogDiv.append(p);
```

---

## 🟠 Logic & JavaScript mistakes

### 5. Input parsing is broken

```js
let [i_loc, _, j_loc] = inputLoc.value;
```

❌ **Problem**

* This reads characters, not numbers
* `_` is just a variable name, not ignored
* `"0,2"` becomes `["0", ",", "2"]` (strings)

✅ **Fix**

```js
const [i_loc, j_loc] = inputLoc.value.split(",").map(Number);
```

Also validate:

```js
if (Number.isNaN(i_loc) || Number.isNaN(j_loc)) return;
```

---

### 6. `reduce()` usage is wrong

```js
row.reduce((acc, curr) => acc.textContent + curr.textContent);
```

❌ **Problem**
`acc` becomes a string after the first iteration, so `acc.textContent` crashes.

✅ **Fix**

```js
row.reduce((acc, curr) => acc + curr.textContent, "");
```

Same bug exists in column check.

---

### 7. `continueCheck` loses `this`

```js
const continueCheck = function (symbolCount, player) {
  this.resetField(); // ❌ this is undefined
};
```

❌ **Problem**
Regular functions don’t inherit `this`.

✅ **Fix**
Use arrow function:

```js
const continueCheck = (symbolCount, player) => {
  if (symbolCount === player.symbol.repeat(3)) {
    this.resetField();
    return false;
  }
  return true;
};
```

---

### 8. `gameCanContinue()` sometimes returns `undefined`

If the move is **not on the main diagonal**, there’s no return at the end.

❌ **Problem**
`undefined` is treated as `false` in your logic → game may end incorrectly.

✅ **Fix**
Add:

```js
return true;
```

at the bottom of the function.

---

## 🟡 Event listener mistakes (very common)

### 9. `addEventListener` executed immediately

```js
setupStartButton.addEventListener("click", setupDialog.showModal());
```

❌ **Problem**
`showModal()` runs immediately when the script loads.

✅ **Fix**

```js
setupStartButton.addEventListener("click", () => setupDialog.showModal());
```

---

### 10. Winner message is incorrect

```js
`Player${this.currentPlayer} has won`
```

❌ **Problem**
`this.currentPlayer` is an object → `[object Object]`

✅ **Fix**

```js
`Player ${this.currentPlayer.name} has won`
```

---

## 🟢 Design / best-practice issues (not fatal)

### 11. Duplicate DOM appending in `showField()`

You keep appending the same cells every move.

✅ **Fix**
Clear first:

```js
fieldDiv.innerHTML = "";
```

---

### 12. IDs with spaces are invalid

```js
square.id = `cell ${i}-${j}`;
```

❌ **Problem**
IDs must not contain spaces.

✅ **Fix**

```js
square.id = `cell-${i}-${j}`;
```

---

## ✅ Summary of the **biggest blockers**

If you fix only these first, your game will start behaving correctly:

1. `addEventListener` misuse (passing function calls)
2. Broken `reduce()` logic
3. `this` lost inside `continueCheck`
4. Input parsing
5. Invalid `removeEventListener`
6. Missing return in `gameCanContinue`

If you want, I can:

* Refactor `moveDialog()` cleanly
* Rewrite `gameCanContinue()` in a simpler way
* Help you separate **game logic from DOM logic**

Just tell me 👍

 * 
 */
