import React from 'react';
import { BarChart3, MapPin, Calendar, TrendingUp, Loader2 } from 'lucide-react';

const DashboardStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No data available</div>
          <div className="text-sm">Unable to load dashboard statistics</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Overview</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Species</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalSpecies?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Observations</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalObservations?.toLocaleString() || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {stats.yearRange && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Year Range</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.yearRange.min} - {stats.yearRange.max}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Species */}
      {stats.topSpecies && stats.topSpecies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Observed Species</h3>
          
          <div className="space-y-3">
            {stats.topSpecies.slice(0, 5).map((species, index) => (
              <div key={species.speciesKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {species.scientificName}
                  </div>
                  {species.vernacularName && (
                    <div className="text-xs text-gray-600 truncate">
                      {species.vernacularName}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <div className="text-sm font-semibold text-primary-600">
                    {species.observationCount?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">obs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Getting Started</h4>
            <p className="text-sm text-blue-700">
              Use the search bar above to find and explore specific species. 
              Select a species to view its observations on the map and timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
