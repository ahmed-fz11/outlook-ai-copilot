def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
    assert data["environment"] == "development"

    services = data["services"]
    assert "database" in services
    assert "openai" in services
    assert "supabase" in services

    # In local dev without keys configured, these are expected values
    assert services["openai"] in ("configured", "not_configured")
    assert services["supabase"] in ("configured", "not_configured")
    assert services["database"] in ("connected", "not_configured", "error")
