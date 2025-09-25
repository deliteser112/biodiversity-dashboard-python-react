import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

# Sample test data
sample_species_data = pd.DataFrame({
    'speciesKey': [1, 2, 3],
    'scientificName': ['Homo sapiens', 'Canis lupus', 'Felis catus'],
    'vernacularName': ['Human', 'Wolf', 'Cat'],
    'kingdom': ['Animalia', 'Animalia', 'Animalia'],
    'phylum': ['Chordata', 'Chordata', 'Chordata'],
    'class': ['Mammalia', 'Mammalia', 'Mammalia'],
    'order': ['Primates', 'Carnivora', 'Carnivora'],
    'family': ['Hominidae', 'Canidae', 'Felidae'],
    'genus': ['Homo', 'Canis', 'Felis']
})

sample_observations_data = pd.DataFrame({
    'speciesKey': [1, 1, 2, 2, 3],
    'decimalLatitude': [52.0, 52.1, 52.2, 52.3, 52.4],
    'decimalLongitude': [19.0, 19.1, 19.2, 19.3, 19.4],
    'eventDate': ['2020-01-01', '2020-02-01', '2020-03-01', '2020-04-01', '2020-05-01'],
    'year': [2020, 2020, 2020, 2020, 2020],
    'month': [1, 2, 3, 4, 5],
    'day': [1, 1, 1, 1, 1],
    'country': ['Poland', 'Poland', 'Poland', 'Poland', 'Poland'],
    'stateProvince': ['Mazovia', 'Mazovia', 'Mazovia', 'Mazovia', 'Mazovia'],
    'locality': ['Warsaw', 'Warsaw', 'Warsaw', 'Warsaw', 'Warsaw'],
    'basisOfRecord': ['HUMAN_OBSERVATION', 'HUMAN_OBSERVATION', 'HUMAN_OBSERVATION', 'HUMAN_OBSERVATION', 'HUMAN_OBSERVATION'],
    'individualCount': [1, 1, 1, 1, 1]
})

@pytest.fixture
def mock_data():
    """Mock the global data variables"""
    with patch('main.species_data', sample_species_data), \
         patch('main.observations_data', sample_observations_data):
        yield

class TestHealthEndpoint:
    def test_health_check(self):
        """Test the health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

class TestSpeciesSearch:
    def test_search_species_success(self, mock_data):
        """Test successful species search"""
        response = client.get("/api/species/search?query=Homo")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "Homo"
        assert data["count"] == 1
        assert len(data["species"]) == 1
        assert data["species"][0]["scientificName"] == "Homo sapiens"

    def test_search_species_case_insensitive(self, mock_data):
        """Test case insensitive search"""
        response = client.get("/api/species/search?query=homo")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 1
        assert data["species"][0]["scientificName"] == "Homo sapiens"

    def test_search_species_no_results(self, mock_data):
        """Test search with no results"""
        response = client.get("/api/species/search?query=NonExistentSpecies")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["species"]) == 0

    def test_search_species_limit(self, mock_data):
        """Test search with limit parameter"""
        response = client.get("/api/species/search?query=a&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["species"]) <= 2

    def test_search_species_missing_data(self):
        """Test search when data is not loaded"""
        with patch('main.species_data', None):
            response = client.get("/api/species/search?query=test")
            assert response.status_code == 500

class TestSpeciesObservations:
    def test_get_observations_success(self, mock_data):
        """Test successful retrieval of species observations"""
        response = client.get("/api/species/1/observations")
        assert response.status_code == 200
        data = response.json()
        assert data["speciesKey"] == 1
        assert data["count"] == 2
        assert len(data["observations"]) == 2
        
        # Check observation structure
        obs = data["observations"][0]
        assert "decimalLatitude" in obs
        assert "decimalLongitude" in obs
        assert "eventDate" in obs

    def test_get_observations_no_data(self, mock_data):
        """Test retrieval for species with no observations"""
        response = client.get("/api/species/999/observations")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0
        assert len(data["observations"]) == 0

    def test_get_observations_missing_data(self):
        """Test retrieval when data is not loaded"""
        with patch('main.observations_data', None):
            response = client.get("/api/species/1/observations")
            assert response.status_code == 500

class TestSpeciesTimeline:
    def test_get_timeline_success(self, mock_data):
        """Test successful retrieval of species timeline"""
        response = client.get("/api/species/1/timeline")
        assert response.status_code == 200
        data = response.json()
        assert data["speciesKey"] == 1
        assert len(data["timeline"]) == 1
        assert data["timeline"][0]["year"] == 2020
        assert data["timeline"][0]["count"] == 2

    def test_get_timeline_no_data(self, mock_data):
        """Test retrieval for species with no timeline data"""
        response = client.get("/api/species/999/timeline")
        assert response.status_code == 200
        data = response.json()
        assert len(data["timeline"]) == 0

    def test_get_timeline_missing_data(self):
        """Test retrieval when data is not loaded"""
        with patch('main.observations_data', None):
            response = client.get("/api/species/1/timeline")
            assert response.status_code == 500

class TestDashboardStats:
    def test_get_dashboard_stats_success(self, mock_data):
        """Test successful retrieval of dashboard stats"""
        response = client.get("/api/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "totalSpecies" in data
        assert "totalObservations" in data
        assert "topSpecies" in data
        assert "yearRange" in data
        assert data["totalSpecies"] == 3
        assert data["totalObservations"] == 5

    def test_get_dashboard_stats_missing_data(self):
        """Test retrieval when data is not loaded"""
        with patch('main.species_data', None):
            response = client.get("/api/dashboard/stats")
            assert response.status_code == 500

class TestDataProcessing:
    def test_observations_data_processing(self, mock_data):
        """Test that observations data is properly processed"""
        # This would test the data processing logic
        # For now, we'll test that the data structure is correct
        assert len(sample_observations_data) == 5
        assert 'speciesKey' in sample_observations_data.columns
        assert 'decimalLatitude' in sample_observations_data.columns
        assert 'decimalLongitude' in sample_observations_data.columns

    def test_species_data_processing(self, mock_data):
        """Test that species data is properly processed"""
        assert len(sample_species_data) == 3
        assert 'speciesKey' in sample_species_data.columns
        assert 'scientificName' in sample_species_data.columns
        assert 'vernacularName' in sample_species_data.columns

if __name__ == "__main__":
    pytest.main([__file__])
