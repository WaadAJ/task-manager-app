def test_register_new_user(client):
    response = client.post(
        "/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "supersecret123",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "alice"
    assert body["email"] == "alice@example.com"
    assert "hashed_password" not in body  # password should never be returned


def test_register_duplicate_username_fails(client):
    payload = {
        "username": "alice",
        "email": "alice@example.com",
        "password": "supersecret123",
    }
    client.post("/auth/register", json=payload)

    response = client.post(
        "/auth/register",
        json={**payload, "email": "different@example.com"},
    )
    assert response.status_code == 400


def test_login_with_correct_credentials_returns_tokens(client):
    client.post(
        "/auth/register",
        json={
            "username": "bob",
            "email": "bob@example.com",
            "password": "mypassword123",
        },
    )
    response = client.post(
        "/auth/login",
        data={"username": "bob", "password": "mypassword123"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_login_with_wrong_password_fails(client):
    client.post(
        "/auth/register",
        json={
            "username": "carol",
            "email": "carol@example.com",
            "password": "correctpassword",
        },
    )
    response = client.post(
        "/auth/login",
        data={"username": "carol", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_me_requires_valid_token(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
