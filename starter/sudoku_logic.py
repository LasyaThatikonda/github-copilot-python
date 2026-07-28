import copy
import random

SIZE = 9
EMPTY = 0
DEFAULT_DIFFICULTY = 'medium'
DIFFICULTY_SETTINGS = {
    'easy': 40,
    'medium': 35,
    'hard': 28,
}


def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True


def find_incorrect_cells(board, solution):
    incorrect = []
    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return incorrect

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def find_empty_cell(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                return row, col
    return None, None


def count_solutions(board, limit=2):
    def backtrack(current_board):
        nonlocal solution_count
        if solution_count >= limit:
            return

        row, col = find_empty_cell(current_board)
        if row is None:
            solution_count += 1
            return

        for num in range(1, SIZE + 1):
            if is_safe(current_board, row, col, num):
                current_board[row][col] = num
                backtrack(current_board)
                current_board[row][col] = EMPTY
                if solution_count >= limit:
                    return

    solution_count = 0
    backtrack(board)
    return solution_count


def remove_cells(board, clues):
    target_clues = clues
    positions = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(positions)

    for row, col in positions:
        if sum(cell != EMPTY for row_values in board for cell in row_values) <= target_clues:
            break
        if board[row][col] == EMPTY:
            continue

        original_value = board[row][col]
        board[row][col] = EMPTY
        if count_solutions(deep_copy(board)) != 1:
            board[row][col] = original_value


def get_clue_count(difficulty=None, clues=None):
    if clues is not None:
        return clues

    normalized = (difficulty or DEFAULT_DIFFICULTY).strip().lower()
    if normalized in DIFFICULTY_SETTINGS:
        return DIFFICULTY_SETTINGS[normalized]
    return DIFFICULTY_SETTINGS[DEFAULT_DIFFICULTY]


def generate_puzzle(clues=None, difficulty=None):
    clue_count = get_clue_count(difficulty=difficulty, clues=clues)
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clue_count)
    puzzle = deep_copy(board)
    return puzzle, solution
