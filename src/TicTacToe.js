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
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";


    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {

    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    if(winner === null && this.state.xIsNext) {
      let best_move = alphabeta(current.squares, 9, -1, 1, true, this.state.xIsNext ? "O" : "X", this.state.xIsNext ? "O" : "X")
      this.handleClick(best_move[1])
    }
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
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function alphabeta(node, depth, alpha, beta, maximizingPlayer, player, optimizer) {
    let nextPlayer = null
    if (player === "X") {
      nextPlayer = "O"
    }
    else {
      nextPlayer = "X"
    }
    let winner = calculateWinner(node)
    if (depth === 0 || winner != null) {
      if( winner ===  "X") {
        return [1, null]
      }
      if( winner === "O") {
        return  [-1, null]
      }
      else {
        return  [0, null]
      }
    }

    if (maximizingPlayer) {
        let value = -1
        let alpha_new = alpha
        let children = findChildren(node, nextPlayer)
        let best_move = null

        for (let i = 0; i < children.length; i++) {
          let child = children[i].squares.slice()
          let output = alphabeta(child, depth - 1, alpha, beta, false, nextPlayer, optimizer)
          value = Math.max(output[0], value)
          alpha_new = Math.max(alpha_new, value)

          if (output[0] === value) {
            best_move = children[i].move
          }
          if (alpha_new >= beta) {
            break;
          }
        }

        return [value, best_move]
    }
    else {
        let value = 1
        let beta_new = beta
        let children = findChildren(node, nextPlayer)
        let best_move = null
        for (let i = 0; i < children.length; i++) {
          let child = children[i].squares.slice()
          let output = alphabeta(child, depth - 1, alpha, beta, true, nextPlayer, optimizer)
          value = Math.min(value, output[0])
          beta_new = Math.min(beta_new, value)
          if (output[0] === value) {
            best_move = children[i].move
          }
          if (alpha >= beta_new) {
            break;
          }
        }
        return [value, best_move]
    }
}

function findChildren(squares, nextPlayer) {
  let children = []
  for (let i = 0; i < squares.length; i++) {
    if(squares[i] === null) {
      let new_child = squares.slice();
      new_child[i] = nextPlayer
      children.push({move: i, squares: new_child})
    }
  }
  return children
}
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
