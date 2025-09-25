import React from 'react';
import { X, MapPin, Calendar, Eye, Layers } from 'lucide-react';

const SpeciesInfo = ({ species, observationCount, onClear }) => {
  const formatTaxonomy = (species) => {
    const taxonomy = [
      species.kingdom,
      species.phylum,
      species.class,
      species.order,
      species.family,
      species.genus
    ].filter(Boolean);
    
    return taxonomy.join(' → ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {species.scientificName}
            </h3>
            {species.vernacularName && (
              <p className="text-sm text-gray-600 mb-2">
                {species.vernacularName}
              </p>
            )}
          </div>
          <button
            onClick={onClear}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Observation Count */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Eye className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{observationCount}</div>
            <div className="text-sm text-gray-600">Observations</div>
          </div>
        </div>

        {/* Taxonomy */}
        {formatTaxonomy(species) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Taxonomy</span>
            </div>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {formatTaxonomy(species)}
            </div>
          </div>
        )}

        {/* Species Key */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Species Key</div>
          <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
            {species.speciesKey}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClear}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpeciesInfo;
