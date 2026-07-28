import pytest

import sudoku_logic


def test_create_empty_board_has_correct_shape():
    board = sudoku_logic.create_empty_board()

    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_is_safe_detects_conflicts_in_row_column_and_box():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5
    board[0][1] = 5

    assert sudoku_logic.is_safe(board, 0, 2, 5) is False
    assert sudoku_logic.is_safe(board, 2, 0, 5) is False

    board = sudoku_logic.create_empty_board()
    board[0][0] = 1
    board[1][1] = 1

    assert sudoku_logic.is_safe(board, 2, 2, 1) is False


def test_is_safe_allows_valid_placement():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 1
    board[0][1] = 2
    board[1][0] = 3

    assert sudoku_logic.is_safe(board, 2, 2, 4) is True


def test_generate_puzzle_returns_puzzle_and_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)

    assert isinstance(puzzle, list)
    assert isinstance(solution, list)
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == sudoku_logic.SIZE for row in solution)
    assert puzzle != solution


@pytest.mark.parametrize(
    ("difficulty", "expected_clues"),
    [("easy", 40), ("medium", 35), ("hard", 28)],
)
def test_generate_puzzle_respects_difficulty_clue_count(difficulty, expected_clues):
    puzzle, _ = sudoku_logic.generate_puzzle(difficulty=difficulty)

    clue_count = sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row)

    assert clue_count == expected_clues
