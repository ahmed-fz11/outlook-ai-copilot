def test_generate_draft_mock(client):
    payload = {
        "email": {
            "sender_email": "alice@example.com",
            "subject": "Pricing inquiry",
            "body": "Hi, I'd like to know about your pricing for the enterprise plan.",
        },
        "tone": "professional",
    }
    response = client.post("/api/drafts/generate-mock", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "draft_reply" in data
    assert "missing_information" in data
