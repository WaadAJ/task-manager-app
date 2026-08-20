def test_tasks_require_authentication(client):
    response = client.get("/tasks")
    assert response.status_code == 401


def test_create_and_list_task(client, auth_headers):
    create_response = client.post(
        "/tasks",
        json={"title": "Write SOP draft", "description": "Purdue SWE application"},
        headers=auth_headers,
    )
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["title"] == "Write SOP draft"
    assert created["completed"] is False

    list_response = client.get("/tasks", headers=auth_headers)
    assert list_response.status_code == 200
    tasks = list_response.json()
    assert len(tasks) == 1
    assert tasks[0]["title"] == "Write SOP draft"


def test_update_task(client, auth_headers):
    created = client.post(
        "/tasks",
        json={"title": "Original title"},
        headers=auth_headers,
    ).json()

    update_response = client.put(
        f"/tasks/{created['id']}",
        json={"title": "Updated title", "description": "Now with a description"},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated title"


def test_toggle_task_completion(client, auth_headers):
    created = client.post(
        "/tasks",
        json={"title": "Finish CI setup"},
        headers=auth_headers,
    ).json()
    assert created["completed"] is False

    toggle_response = client.patch(
        f"/tasks/{created['id']}/complete",
        headers=auth_headers,
    )
    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True

    # toggling again should flip it back
    toggle_again = client.patch(
        f"/tasks/{created['id']}/complete",
        headers=auth_headers,
    )
    assert toggle_again.json()["completed"] is False


def test_delete_task(client, auth_headers):
    created = client.post(
        "/tasks",
        json={"title": "Temporary task"},
        headers=auth_headers,
    ).json()

    delete_response = client.delete(f"/tasks/{created['id']}", headers=auth_headers)
    assert delete_response.status_code == 200

    list_response = client.get("/tasks", headers=auth_headers)
    assert list_response.json() == []


def test_update_nonexistent_task_returns_404(client, auth_headers):
    response = client.put(
        "/tasks/9999",
        json={"title": "Does not exist"},
        headers=auth_headers,
    )
    assert response.status_code == 404


def test_bulk_create_tasks(client, auth_headers):
    response = client.post(
        "/tasks/bulk",
        json=[{"title": "Task A"}, {"title": "Task B"}, {"title": "Task C"}],
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert len(response.json()) == 3


def test_user_cannot_see_another_users_tasks(client):
    # user 1 creates a task
    client.post(
        "/auth/register",
        json={"username": "user_one", "email": "one@example.com", "password": "password123"},
    )
    login_one = client.post("/auth/login", data={"username": "user_one", "password": "password123"})
    headers_one = {"Authorization": f"Bearer {login_one.json()['access_token']}"}
    client.post("/tasks", json={"title": "User one's private task"}, headers=headers_one)

    # user 2 should not see it
    client.post(
        "/auth/register",
        json={"username": "user_two", "email": "two@example.com", "password": "password123"},
    )
    login_two = client.post("/auth/login", data={"username": "user_two", "password": "password123"})
    headers_two = {"Authorization": f"Bearer {login_two.json()['access_token']}"}

    response = client.get("/tasks", headers=headers_two)
    assert response.json() == []
