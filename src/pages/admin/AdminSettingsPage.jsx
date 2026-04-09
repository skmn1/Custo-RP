import React from 'react';
import SettingsPage from '../SettingsPage';

/**
 * Wraps the existing SettingsPage component inside the Admin app shell.
 * Does not duplicate — simply renders the same component at /app/admin/settings.
 */
const AdminSettingsPage = () => {
  return <SettingsPage />;
};

export default AdminSettingsPage;
