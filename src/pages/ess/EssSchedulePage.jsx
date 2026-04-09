/**
 * EssSchedulePage — read-only employee schedule view.
 *
 * Component tree:
 *   <EssSchedulePage>
 *     <ScheduleHeader viewToggle navigation />
 *     <ScheduleCalendar>
 *       <WeekView shifts leave />    ← or <MonthView />
 *     </ScheduleCalendar>
 *     <UpcomingShiftsList shifts />
 *     <ReadOnlyBanner />
 *   </EssSchedulePage>
 *
 * All data is scoped to the authenticated employee — no employeeId parameter
 * is passed to the API (ownership enforced server-side by EssController).
 */
import React from 'react';
import { useEssSchedule } from '../../hooks/useEssSchedule';
import ScheduleHeader from '../../components/ess/schedule/ScheduleHeader';
import WeekView from '../../components/ess/schedule/WeekView';
import MonthView from '../../components/ess/schedule/MonthView';
import UpcomingShiftsList from '../../components/ess/schedule/UpcomingShiftsList';
import ReadOnlyBanner from '../../components/ess/schedule/ReadOnlyBanner';

const EssSchedulePage = () => {
  const {
    shifts,
    leave,
    upcoming,
    isLoading,
    viewMode,
    setViewMode,
    anchor,
    navigatePrev,
    navigateNext,
    goToday,
  } = useEssSchedule();

  return (
    <div>
      {/* Header: title, view toggle (Week/Month), Today button, prev/next arrows */}
      <ScheduleHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        anchor={anchor}
        onPrev={navigatePrev}
        onNext={navigateNext}
        onToday={goToday}
      />

      {/* Calendar grid — week or month */}
      {viewMode === 'week' ? (
        <WeekView
          anchor={anchor}
          shifts={shifts}
          leave={leave}
          isLoading={isLoading}
        />
      ) : (
        <MonthView
          anchor={anchor}
          shifts={shifts}
          leave={leave}
          isLoading={isLoading}
        />
      )}

      {/* Read-only banner — always rendered below the calendar */}
      <ReadOnlyBanner />

      {/* Upcoming shifts panel */}
      <UpcomingShiftsList upcoming={upcoming} isLoading={isLoading} />
    </div>
  );
};

export default EssSchedulePage;

