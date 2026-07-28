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

def remove_cells(board, clues):
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1

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
