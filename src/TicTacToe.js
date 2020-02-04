import React from "react"

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      ai: "X",
      stepNumber: 0,
      xIsNext: true
    };
  }
  //Run AI's move on initial mount.
  componentDidMount() {
    console.log("Mounted!")
    this.runAI([{squares: Array(9).fill(null)}], true, this.state.ai)
  }

  //Handles a players move.
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    let xIsNext = this.state.xIsNext
    squares[i] = this.state.xIsNext ? "X" : "O";
    history.push(
      {
        squares: squares
      }
    )
    this.setState({
      history: history,
      stepNumber: history.length - 1,
      xIsNext: !xIsNext
    });
    this.runAI(history, !xIsNext, this.state.ai)
  }

//This runs the AI's next move.  Only runs if it's the AI's turn and no one has won.
  runAI(history, xIsNext, ai) {
    let squares = history[history.length - 1].squares.slice()
    if(calculateWinner(squares) === null && ai === (xIsNext ? "X" : "O")) {
      let best_move = alphabeta(squares, 9, -1, 1, true, ai, ai)
      squares[best_move[1]] = ai
      this.setState({
        history: history.concat([
          {
            squares: squares
          }
        ]),
        stepNumber: history.length,
        xIsNext: !xIsNext
      });
    }

  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  resetGame(ai) {
      this.setState({
        ai: ai,
      })
      this.setState({
        history: [{squares: Array(9).fill(null)}],
        stepNumber: 0,
        xIsNext: true
      })
      if (ai === "X") {
        this.runAI([{squares: Array(9).fill(null)}], true, ai)
      }

  }
  //Renders game state
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <button onClick={() => this.resetGame("O")}>{'Play as X'}</button>
          <button onClick={() => this.resetGame("X")}>{'Play as O'}</button>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

//Flips Xs to Os and vice versa
function flipPlayer(player) {
  if (player === "X") {
    return "O"
  }
  if (player === "O") {
    return "X"
  }
  return Error
}

//This runs alpha beta pruning on the game state tree, and returns the best
//move.  Solves for optimizer winning.
function alphabeta(node, depth, alpha, beta, maximizingPlayer, player, optimizer) {
    let nextPlayer = flipPlayer(player)
    let winner = calculateWinner(node)
    if (depth === 0 || winner != null) {
      if (winner === optimizer) {
        return [1, null]
      }
      if (winner === flipPlayer(optimizer)) {
        return  [-1, null]
      }
      else {
        return  [0, null]
      }
    }

    if (maximizingPlayer) {
        let value = -1
        let alpha_new = alpha
        let children = findChildren(node, player)
        let best_move = null

        for (let i = 0; i < children.length; i++) {
          let child = children[i].squares.slice()
          let output = alphabeta(child, depth - 1, alpha, beta, false, nextPlayer, optimizer)
          value = Math.max(output[0], value)
          alpha_new = Math.max(alpha_new, value)

          if (output[0] === value) {
            best_move = children[i].move
          }
          if(alpha_new > beta) {
            break;
          }
        }

        return [value, best_move]
    }
    else {
        let value = 1
        let beta_new = beta
        let children = findChildren(node, player)
        let best_move = null
        for (let i = 0; i < children.length; i++) {
          let child = children[i].squares.slice()
          let output = alphabeta(child, depth - 1, alpha, beta, true, nextPlayer, optimizer)
          value = Math.min(value, output[0])
          beta_new = Math.min(beta_new, value)
          if (output[0] === value) {
            best_move = children[i].move
          }
          if (alpha > beta_new) {
            break;
          }
        }
        return [value, best_move]
    }
}

//Returns all possible next game board states if nextPlayer moves
function findChildren(squares, nextPlayer) {
  let children = []
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      let new_child = squares.slice();
      new_child[i] = nextPlayer
      children.push({move: i, squares: new_child})
    }
  }
  return children
}

//Modfied to include case of ties.
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  let tie = true
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] == null) {
      tie = false
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  if (tie) {
    return "None"
  }
  return null;
}
