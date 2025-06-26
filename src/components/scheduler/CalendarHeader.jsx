import React from 'react';
import { isToday, format } from 'date-fns';
import { DAY_NAMES, DAY_ABBREVIATIONS } from '../../constants/scheduler';

const CalendarHeader = ({ weekDays }) => {
  return (
    <div className="grid grid-cols-8 gap-0 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
      <div className="p-4 border-r border-gray-200 font-semibold text-gray-900 sticky left-0 z-20 bg-white">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Employee</span>
        </div>
      </div>
      {weekDays.map((day, index) => {
        const isTodayCheck = isToday(day);
        return (
          <div key={index} className={`p-4 border-r border-gray-200 text-center ${isTodayCheck ? 'bg-blue-100' : ''}`}>
            <div className={`font-semibold ${isTodayCheck ? 'text-blue-900' : 'text-gray-900'}`}>
              <span className="hidden sm:inline">{DAY_NAMES[index]}</span>
              <span className="sm:hidden">{DAY_ABBREVIATIONS[index]}</span>
            </div>
            <div className={`text-sm mt-1 ${isTodayCheck ? 'text-blue-700' : 'text-gray-600'}`}>
              {format(day, 'MMM d')}
            </div>
            {isTodayCheck && (
              <div className="text-xs font-medium text-blue-600 mt-1">Today</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarHeader;
