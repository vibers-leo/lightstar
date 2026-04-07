import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { searchCities } from '../../constants/worldCities';
import type { City } from '../../constants/worldCities';

interface CitySearchInputProps {
  value: City | null;
  onChange: (city: City | null) => void;
  placeholder?: string;
}

export default function CitySearchInput({ value, onChange, placeholder = '도시 검색...' }: CitySearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    const found = searchCities(q);
    setResults(found);
    setIsOpen(found.length > 0);
  };

  const handleSelect = (city: City) => {
    onChange(city);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 선택된 도시 표시 */}
      {value ? (
        <div className="flex items-center justify-between px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-violet-500" />
            <span className="text-gray-900 font-medium">{value.label}</span>
          </div>
          <button onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 text-base"
          />
        </div>
      )}

      {/* 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden z-50">
          {results.map((city, i) => (
            <button
              key={`${city.name}-${city.region}`}
              onMouseDown={() => handleSelect(city)} // mousedown이 blur보다 먼저 발생
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                i < results.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <MapPin size={14} className="text-gray-300 flex-shrink-0" />
              <div>
                <span className="text-gray-900 font-medium text-sm">{city.name}</span>
                {city.region !== city.name && (
                  <span className="text-gray-400 text-sm ml-1.5">{city.region}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색 중인데 결과 없을 때 */}
      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 z-50">
          <p className="text-gray-400 text-sm text-center">검색 결과가 없어요</p>
        </div>
      )}
    </div>
  );
}
