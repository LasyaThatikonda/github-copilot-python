import pytest

import app as flask_app


@pytest.fixture
def client():
    flask_app.app.config["TESTING"] = True

    # Reset global game state
    flask_app.CURRENT["puzzle"] = None
    flask_app.CURRENT["solution"] = None

    with flask_app.app.test_client() as client:
        yield client


def test_index_returns_html(client):
    response = client.get('/')

    assert response.status_code == 200
    assert b'Sudoku Game' in response.data


def test_new_game_returns_puzzle(client):
    response = client.get('/new?clues=35')

    assert response.status_code == 200
    assert response.is_json

    payload = response.get_json()
    assert 'puzzle' in payload
    assert isinstance(payload['puzzle'], list)
    assert len(payload['puzzle']) == 9


def test_check_solution_requires_active_game(client):
    response = client.post('/check', json={'board': [[0] * 9 for _ in range(9)]})

    assert response.status_code == 400
    assert response.get_json()['error'] == 'No game in progress'


def test_check_solution_reports_incorrect_cells(client):
    client.get('/new?clues=35')
    board = [[0] * 9 for _ in range(9)]

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    payload = response.get_json()
    assert 'incorrect' in payload
    assert isinstance(payload['incorrect'], list)
