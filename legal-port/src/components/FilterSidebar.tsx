
import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface Filters {
  maxAudioRate: number;
  maxVideoRate: number;
  maxChatRate: number;
  minRating: number;
  minExperience: number;
  onlineOnly: boolean;
  specializations: string[];
  sortBy: 'rating' | 'experience' | 'audioRate' | 'videoRate' | 'chatRate' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface FilterSidebarProps {
  filters: Filters;
  showFilters: boolean;
  onUpdateFilter: (key: keyof Filters, value: any) => void;
  onToggleSpecialization: (specialization: string) => void;
  onResetFilters: () => void;
  onHideFilters: () => void;
}

const availableSpecializations = [
  'Matrimonial',
  'Commercial',
  'Consumer',
  'Child Laws',
  'Civil',
  'Corporate',
  'Labour Law',
  'Property Rights',
  'Cheque Bounce',
  'Documentation',
  'Criminal',
  'Challans'
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  showFilters,
  onUpdateFilter,
  onToggleSpecialization,
  onResetFilters,
  onHideFilters
}) => {
  return (
    <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-dark-blue flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-xl">
            <Filter className="w-5 h-5 text-gold" />
          </div>
          Filters
        </h2>
        <button
          onClick={onHideFilters}
          className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Sort By</label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilter('sortBy', e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-gold focus:border-gold transition-all duration-300 font-medium"
            >
              <option value="rating">Rating</option>
              <option value="experience">Experience</option>
              <option value="audioRate">Audio Rate</option>
              <option value="videoRate">Video Rate</option>
              <option value="chatRate">Chat Rate</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Sort Order</label>
          <div className="flex gap-3">
            <button
              onClick={() => onUpdateFilter('sortOrder', 'asc')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                filters.sortOrder === 'asc'
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-blue shadow-lg shadow-gold/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low to High
            </button>
            <button
              onClick={() => onUpdateFilter('sortOrder', 'desc')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                filters.sortOrder === 'desc'
                  ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-blue shadow-lg shadow-gold/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High to Low
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">Specializations</label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {availableSpecializations.map((specialization) => (
              <label
                key={specialization}
                className="flex items-center space-x-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.specializations.includes(specialization)}
                  onChange={() => onToggleSpecialization(specialization)}
                  className="w-5 h-5 text-gold bg-gray-100 border-2 border-gray-300 rounded focus:ring-gold focus:ring-2 transition-all duration-300"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gold transition-colors">
                  {specialization}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Max Audio Rate: <span className="text-gold">₹{filters.maxAudioRate}/min</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="10"
                max="40"
                value={filters.maxAudioRate}
                onChange={(e) => onUpdateFilter('maxAudioRate', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${((filters.maxAudioRate - 10) / (40 - 10)) * 100}%, #E5E7EB ${((filters.maxAudioRate - 10) / (40 - 10)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Max Video Rate: <span className="text-gold">₹{filters.maxVideoRate}/min</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="5"
                max="30"
                value={filters.maxVideoRate}
                onChange={(e) => onUpdateFilter('maxVideoRate', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${((filters.maxVideoRate - 5) / (30 - 5)) * 100}%, #E5E7EB ${((filters.maxVideoRate - 5) / (30 - 5)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Max Chat Rate: <span className="text-gold">₹{filters.maxChatRate}/min</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="8"
                max="35"
                value={filters.maxChatRate}
                onChange={(e) => onUpdateFilter('maxChatRate', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${((filters.maxChatRate - 8) / (35 - 8)) * 100}%, #E5E7EB ${((filters.maxChatRate - 8) / (35 - 8)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Minimum Rating: <span className="text-gold">{filters.minRating} stars</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={filters.minRating}
                onChange={(e) => onUpdateFilter('minRating', parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${(filters.minRating / 5) * 100}%, #E5E7EB ${(filters.minRating / 5) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Minimum Experience: <span className="text-gold">{filters.minExperience} years</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="25"
                value={filters.minExperience}
                onChange={(e) => onUpdateFilter('minExperience', parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
                style={{
                  background: `linear-gradient(to right, #EB9601 0%, #EB9601 ${(filters.minExperience / 25) * 100}%, #E5E7EB ${(filters.minExperience / 25) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center space-x-4 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.onlineOnly}
              onChange={(e) => onUpdateFilter('onlineOnly', e.target.checked)}
              className="w-5 h-5 text-gold bg-gray-100 border-2 border-gray-300 rounded focus:ring-gold transition-all duration-300"
            />
            <span className="text-sm font-bold text-gray-700 group-hover:text-gold transition-colors">Show Online Only</span>
          </label>
        </div>

        <button
          onClick={onResetFilters}
          className="w-full py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-300 hover:scale-105"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
