import React, { useCallback, useState } from 'react';

import s from './styles.module.css';

type Marker = 'cross' | 'circle';

type Cell = {
  row: number;
  column: number;
  marker: Marker | undefined;
};

type Board = Array<Cell[]>;

type State = {
  board: Board;
  markCount: number;
  activeMarker: Marker;
  winner: Marker | null;
};

type Props = {
  boardSize?: number;
};

const generateBoard = (size: number): Board =>
  Array.from({ length: size }, (_, rowIndex) =>
    Array.from({ length: size }, (_, columnIndex) => ({
      row: rowIndex,
      column: columnIndex,
      marker: undefined,
    })),
  );

const getWinner = (
  board: Board,
  { row, column, marker }: Cell,
  winSequenceCount: number,
): Marker | null => {
  if (!marker) {
    return null;
  }

  const rowSequenceCount = board[row]
    .filter(item => item.marker === marker)
    .reduce((acc, cell, index, array) => {
      if (acc >= winSequenceCount) {
        return acc;
      }

      if (cell.column === array[index + 1]?.column - 1) {
        return acc + 1;
      }

      return 1;
    }, 1);

  if (rowSequenceCount >= winSequenceCount) {
    return marker;
  }

  const columnMatchCount = board
    .map(row => row[column])
    .filter(item => item.marker === marker)
    .reduce((acc, cell, index, array) => {
      if (acc >= winSequenceCount) {
        return acc;
      }

      if (cell.row === array[index + 1]?.row - 1) {
        return acc + 1;
      }

      return 1;
    }, 1);

  if (columnMatchCount >= winSequenceCount) {
    return marker;
  }

  return null;
};

const DEFAULT_BOARD_SIZE = 10;

const getInitialState = (boardSize: number): State => ({
  board: generateBoard(boardSize),
  markCount: 0,
  activeMarker: 'cross',
  winner: null,
});

export const Game = ({ boardSize = DEFAULT_BOARD_SIZE }: Props) => {
  const [winSequenceCount, setWinSequenceCount] = useState(3);
  const [state, setState] = useState(getInitialState(boardSize));

  const handleMove = useCallback(
    (cell: Cell) => () => {
      if (cell.marker || state.winner) {
        return;
      }

      const markedCell: Cell = {
        ...cell,
        marker: state.activeMarker,
      };

      const updatedMarkCount = state.markCount + 1;
      const updatedBoard = [...state.board];

      updatedBoard[markedCell.row][markedCell.column].marker = markedCell.marker;

      const nextMoveState: State = {
        ...state,
        board: updatedBoard,
        markCount: updatedMarkCount,
        activeMarker: state.activeMarker === 'cross' ? 'circle' : 'cross',
      };

      if (updatedMarkCount + 1 >= winSequenceCount * 2) {
        nextMoveState.winner = getWinner(updatedBoard, markedCell, winSequenceCount);
      }

      setState(nextMoveState);
    },
    [state, winSequenceCount],
  );

  const handleReset = useCallback(() => {
    setState(getInitialState(boardSize));
  }, [boardSize]);

  const handleWinSequenceCountChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(
    ({ target }) => {
      setWinSequenceCount(Number(target.value));
      handleReset();
    },
    [handleReset],
  );

  return (
    <main className={s.root}>
      <header className={s.header}>
        <div>
          mark count: #{state.markCount}
          <br />
          next marker:&nbsp;
          <span className={state.winner ? '' : s[`color-${state.activeMarker}`]}>
            {state.activeMarker}
          </span>
        </div>
        <select
          name="min-win-match"
          onChange={handleWinSequenceCountChange}
          value={winSequenceCount}
          className={s.winSequenceSelect}
        >
          {[3, 4, 5].map(value => (
            <option key={`min-win-match-option-${value}`} value={value}>
              {value}
            </option>
          ))}
        </select>
      </header>

      <div className={s.board}>
        {state.board.map((row, rowIndex) => (
          <div key={rowIndex} className={s.row}>
            {row.map((cell, cellIndex) => (
              <span onClick={handleMove(cell)} key={cellIndex} className={s.cell}>
                {cell.row}/{cell.column}
                {cell.marker === 'cross' && <span className={s.cross} />}
                {cell.marker === 'circle' && <span className={s.circle} />}
              </span>
            ))}
          </div>
        ))}
      </div>
      {state.winner && (
        <div className={s.winner}>
          <span className={state.winner ? s[`color-${state.winner}`] : ''}>
            {state.winner} win!
          </span>
          <button type="button" className={s.resetButton} onClick={handleReset}>
            try again
          </button>
        </div>
      )}
    </main>
  );
};
