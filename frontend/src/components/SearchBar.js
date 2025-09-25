import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { searchSpecies } from '../services/api';

const SearchBar = ({ onSpeciesSelect, onSpeciesClear, selectedSpecies, loading }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);
        const results = await searchSpecies(query, 10);
        setSearchResults(results.species || []);
        setShowResults(true);
      } catch (error) {
        setSearchError('Failed to search species');
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSpeciesClick = (species) => {
    onSpeciesSelect(species);
    setQuery(species.scientificName);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setShowResults(false);
    onSpeciesClear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search for species by name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 search-input"
          disabled={loading}
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {searchResults.map((species, index) => (
            <button
              key={species.speciesKey}
              onClick={() => handleSpeciesClick(species)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex flex-col">
                <div className="font-medium text-gray-900">
                  {species.scientificName}
                </div>
                {species.vernacularName && (
                  <div className="text-sm text-gray-600">
                    {species.vernacularName}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {[species.kingdom, species.phylum, species.class].filter(Boolean).join(' • ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && !isSearching && searchResults.length === 0 && !searchError && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No species found for "{query}"
          </div>
        </div>
      )}

      {/* Search Error */}
      {searchError && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-red-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-red-600 text-center">
            {searchError}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
