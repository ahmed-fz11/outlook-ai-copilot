import sys
import os

import pytest
from fastapi.testclient import TestClient

# Make sure the backend/ directory is on the path so `from main import app`
# works whether tests are run from the project root or from backend/.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)
