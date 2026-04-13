import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { usePosLocation } from '../../hooks/usePosLocation';

/**
 * PoS Location selector dropdown for the PoS sidebar.
 * Renders when the user has access to multiple PoS locations.
 */
const PosLocationSelector = ({ collapsed }) => {
  const { t } = useTranslation(['pos']);
  const { posLocationId } = useParams();
  const navigate = useNavigate();
  const { posLocations, selectedLocation } = usePosLocation();

  if (collapsed || posLocations.length <= 1) return null;

  const currentLocation =
    posLocations.find((loc) => String(loc.id) === String(posLocationId)) || selectedLocation;

  const handleChange = (e) => {
    const id = e.target.value;
    navigate(`/app/pos/${id}/dashboard`);
  };

  return (
    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
      <label className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 block">
        {t('pos:locationSelector')}
      </label>
      <div className="relative">
        <select
          value={currentLocation?.id || ''}
          onChange={handleChange}
          className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          {posLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        <ChevronUpDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default PosLocationSelector;
