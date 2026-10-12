from app.services.auth_service import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    raw = "secure_password_123"
    hashed = get_password_hash(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_token_creation_and_decoding():
    payload = {"sub": "testuser", "role": "admin"}
    token = create_access_token(payload)
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "admin"
