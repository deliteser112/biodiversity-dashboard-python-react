import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import MapVisualization from './components/MapVisualization';
import TimelineChart from './components/TimelineChart';
import SpeciesInfo from './components/SpeciesInfo';
import DashboardStats from './components/DashboardStats';
import { getDashboardStats, searchSpecies, getSpeciesObservations, getSpeciesTimeline } from './services/api';

function App() {
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [observations, setObservations] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard stats on component mount
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const stats = await getDashboardStats();
        setDashboardStats(stats);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  // Load species data when a species is selected
  useEffect(() => {
    if (selectedSpecies) {
      const loadSpeciesData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Load observations and timeline data in parallel
          const [observationsData, timelineData] = await Promise.all([
            getSpeciesObservations(selectedSpecies.speciesKey),
            getSpeciesTimeline(selectedSpecies.speciesKey)
          ]);

          setObservations(observationsData.observations || []);
          setTimelineData(timelineData.timeline || []);
        } catch (err) {
          setError('Failed to load species data');
          console.error('Error loading species data:', err);
        } finally {
          setLoading(false);
        }
      };

      loadSpeciesData();
    } else {
      // Clear data when no species is selected
      setObservations([]);
      setTimelineData([]);
    }
  }, [selectedSpecies]);

  const handleSpeciesSelect = (species) => {
    setSelectedSpecies(species);
  };

  const handleSpeciesClear = () => {
    setSelectedSpecies(null);
    setObservations([]);
    setTimelineData([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar 
            onSpeciesSelect={handleSpeciesSelect}
            onSpeciesClear={handleSpeciesClear}
            selectedSpecies={selectedSpecies}
            loading={loading}
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Map and Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedSpecies ? `${selectedSpecies.scientificName} Observations` : 'Biodiversity Map'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSpecies 
                    ? `Showing ${observations.length} observations of ${selectedSpecies.vernacularName || selectedSpecies.scientificName}`
                    : 'Explore species observations across Poland'
                  }
                </p>
              </div>
              <div className="h-96">
                <MapVisualization 
                  observations={observations}
                  selectedSpecies={selectedSpecies}
                  loading={loading}
                />
              </div>
            </div>

            {selectedSpecies && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Observation Timeline</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Temporal distribution of observations over the years
                  </p>
                </div>
                <div className="h-64 p-6">
                  <TimelineChart data={timelineData} loading={loading} />
                </div>
              </div>
            )}
          </div>

          {/* Right column - Species Info and Stats */}
          <div className="space-y-6">
            {selectedSpecies ? (
              <SpeciesInfo 
                species={selectedSpecies}
                observationCount={observations.length}
                onClear={handleSpeciesClear}
              />
            ) : (
              <DashboardStats 
                stats={dashboardStats}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
