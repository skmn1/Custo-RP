import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PosDashboard from '../components/pos/PosDashboard';
import PosEmployeeList from '../components/pos/PosEmployeeList';
import PosModal from '../components/pos/PosModal';
import DeclareIncidentModal from '../components/pos/DeclareIncidentModal';
import IncidentDrawer from '../components/pos/IncidentDrawer';
import Button from '../components/ui/Button';
import { usePos } from '../hooks/usePos';
import { POS_TYPE_COLORS, DAYS_OF_WEEK } from '../constants/pos';

const TYPE_KEY_MAP = { BUTCHER: 'butcher', GROCERY: 'grocery', FAST_FOOD: 'fastFood', MIXED: 'mixed' };
const DAY_KEY_MAP = { MONDAY: 'monday', TUESDAY: 'tuesday', WEDNESDAY: 'wednesday', THURSDAY: 'thursday', FRIDAY: 'friday', SATURDAY: 'saturday', SUNDAY: 'sunday' };

const StarRating = ({ rating, size = 'w-5 h-5' }) => {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= full ? 'text-yellow-400' : i === full + 1 && half ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
};

const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

const DETAIL_TABS = ['overview', 'identity', 'google', 'incidents', 'history'];

const PosDetailPage = () => {
  const { t } = useTranslation(['pos', 'common']);
  const { id, terminalId } = useParams();
  const posId = terminalId || id;
  const navigate = useNavigate();
  const {
    selectedPos,
    managers,
    profile,
    incidents,
    isLoading,
    error,
    fetchPosDetail,
    updatePos,
    deletePos,
    fetchManagers,
    addEmployee,
    assignEmployee,
    updateEmployee,
    removeEmployee,
    swapEmployee,
    fetchAvailableEmployees,
    fetchProfile,
    updateProfile,
    updateGoogleReviews,
    fetchIncidents,
  } = usePos();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Identity edit state
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [identityForm, setIdentityForm] = useState({});

  // Google edit state
  const [editingGoogle, setEditingGoogle] = useState(false);
  const [googleForm, setGoogleForm] = useState({});

  // Incident state
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentFilter, setIncidentFilter] = useState({ status: '', category: '', severity: '' });

  useEffect(() => {
    if (posId) {
      fetchPosDetail(posId).catch(() => {});
      fetchProfile(posId);
    }
    fetchManagers().catch(() => {});
  }, [posId, fetchPosDetail, fetchProfile, fetchManagers]);

  useEffect(() => {
    if (posId) {
      fetchIncidents(posId, incidentFilter);
    }
  }, [posId, incidentFilter, fetchIncidents]);

  // Sync identity form when profile loads
  useEffect(() => {
    if (profile) {
      setIdentityForm({
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        country: profile.country || '',
        siret: profile.siret || '',
        vatNumber: profile.vatNumber || '',
        nafCode: profile.nafCode || '',
        legalName: profile.legalName || '',
        launchedAt: profile.launchedAt || '',
        phone: profile.phone || '',
      });
      setGoogleForm({
        googlePlaceId: profile.googlePlaceId || '',
        googleMapsUrl: profile.googleMapsUrl || '',
        googleRating: profile.googleRating != null ? String(profile.googleRating) : '',
        googleReviewCount: profile.googleReviewCount != null ? String(profile.googleReviewCount) : '',
      });
    }
  }, [profile]);

  const handleEdit = useCallback(() => {
    setEditModalOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (data) => {
      await updatePos(posId, data);
      await fetchPosDetail(posId);
      await fetchManagers();
    },
    [posId, updatePos, fetchPosDetail, fetchManagers]
  );

  const handleDelete = useCallback(async () => {
    try {
      await deletePos(posId);
      navigate('/app/pos');
    } catch {
      // error handled by hook
    }
    setDeleteConfirm(false);
  }, [posId, deletePos, navigate]);

  const handleSaveIdentity = async () => {
    try {
      await updateProfile(posId, identityForm);
      setEditingIdentity(false);
    } catch {
      // error handled by hook
    }
  };

  const handleSaveGoogle = async () => {
    try {
      const payload = {
        googlePlaceId: googleForm.googlePlaceId || null,
        googleMapsUrl: googleForm.googleMapsUrl || null,
        googleRating: googleForm.googleRating ? parseFloat(googleForm.googleRating) : null,
        googleReviewCount: googleForm.googleReviewCount ? parseInt(googleForm.googleReviewCount, 10) : null,
      };
      await updateGoogleReviews(posId, payload);
      setEditingGoogle(false);
    } catch {
      // error handled by hook
    }
  };

  const handleIncidentCreated = async () => {
    setIncidentModalOpen(false);
    await fetchIncidents(posId, incidentFilter);
    await fetchProfile(posId);
  };

  const handleIncidentUpdated = async () => {
    setSelectedIncident(null);
    await fetchIncidents(posId, incidentFilter);
    await fetchProfile(posId);
  };

  // Loading state
  if (isLoading && !selectedPos) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-4">
            <div className="h-5 w-64 bg-gray-200 rounded" />
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (error || (!isLoading && !selectedPos)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div data-testid="pos-not-found" className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {t('pos:detail.notFound')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {error || t('pos:detail.notFoundDesc')}
          </p>
          <Button variant="primary" onClick={() => navigate('/pos')}>
            ← {t('pos:detail.back')}
          </Button>
        </div>
      </div>
    );
  }

  const pos = selectedPos;
  const typeColor = POS_TYPE_COLORS[pos.type] || POS_TYPE_COLORS.MIXED;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          data-testid="pos-back-link"
          onClick={() => navigate('/pos')}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('pos:detail.back')}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            data-testid="pos-detail-edit-btn"
            className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-50 transition-colors"
            title={t('pos:btn.edit')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setDeleteConfirm(true)}
            data-testid="pos-detail-delete-btn"
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
            title={t('pos:btn.delete')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 data-testid="pos-detail-name" className="text-2xl font-bold text-gray-900">
          {pos.name}
        </h1>
        <span
          data-testid="pos-detail-type-badge"
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text} ${typeColor.border} border`}
        >
          {t(`pos:type.${TYPE_KEY_MAP[pos.type] || pos.type.toLowerCase()}`)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              pos.isActive ? 'bg-green-400' : 'bg-gray-400'
            }`}
          />
          {pos.isActive ? t('pos:status.active') : t('pos:status.inactive')}
        </span>
        {profile?.googleRating != null && (
          <StarRating rating={profile.googleRating} size="w-4 h-4" />
        )}
        {profile?.openIncidentsCount > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {profile.openIncidentsCount} {t('pos:profile.openIncidents')}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`pos:detail.tab.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ Overview Tab ═══ */}
      {activeTab === 'overview' && (
        <>
          {/* Dashboard KPIs */}
          <PosDashboard dashboard={pos.dashboard} />

          {/* Info section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pos:detail.locationInfo')}</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">📍</span>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('pos:detail.address')}</p>
                  <p data-testid="pos-detail-address" className="text-sm text-gray-900">
                    {pos.address}
                  </p>
                </div>
              </div>
              {pos.phone && (
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">📞</span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('pos:detail.phone')}</p>
                    <p data-testid="pos-detail-phone" className="text-sm text-gray-900">
                      {pos.phone}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">👤</span>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('pos:detail.manager')}</p>
                  <p data-testid="pos-detail-manager" className="text-sm text-gray-900">
                    {pos.managerName || t('pos:detail.unassigned')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Employees */}
          <div className="mb-6">
            <PosEmployeeList
              employees={pos.employees || []}
              posId={pos.id}
              posName={pos.name}
              onAdd={addEmployee}
              onAssign={assignEmployee}
              onUpdate={updateEmployee}
              onRemove={removeEmployee}
              onSwap={swapEmployee}
              onFetchAvailableEmployees={fetchAvailableEmployees}
            />
          </div>

          {/* Opening Hours */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pos:detail.openingHours')}</h2>
            <div data-testid="pos-detail-hours" className="divide-y divide-gray-100">
              {DAYS_OF_WEEK.map((day) => {
                const hours = pos.openingHours?.[day];
                return (
                  <div
                    key={day}
                    data-testid={`pos-detail-hours-${day}`}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-sm font-medium text-gray-700 w-28">
                      {t(`pos:days.${DAY_KEY_MAP[day] || day.toLowerCase()}`)}
                    </span>
                    {hours?.closed ? (
                      <span className="text-sm text-gray-400 italic">{t('pos:form.closed')}</span>
                    ) : (
                      <span className="text-sm text-gray-900">
                        {hours?.open || '—'} – {hours?.close || '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══ Identity & Fiscal Tab ═══ */}
      {activeTab === 'identity' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('pos:profile.identity')}</h2>
            {!editingIdentity ? (
              <Button variant="secondary" size="sm" onClick={() => setEditingIdentity(true)}>
                {t('pos:btn.edit')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingIdentity(false)}>
                  {t('common:actions.cancel')}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveIdentity}>
                  {t('common:actions.save')}
                </Button>
              </div>
            )}
          </div>

          {editingIdentity ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'legalName', label: t('pos:profile.field.legalName') },
                { key: 'siret', label: t('pos:profile.field.siret') },
                { key: 'vatNumber', label: t('pos:profile.field.vatNumber') },
                { key: 'nafCode', label: t('pos:profile.field.nafCode') },
                { key: 'addressLine1', label: t('pos:profile.field.addressLine1') },
                { key: 'addressLine2', label: t('pos:profile.field.addressLine2') },
                { key: 'city', label: t('pos:profile.field.city') },
                { key: 'postalCode', label: t('pos:profile.field.postalCode') },
                { key: 'country', label: t('pos:profile.field.country') },
                { key: 'phone', label: t('pos:profile.field.phone') },
                { key: 'launchedAt', label: t('pos:profile.field.launchedAt'), type: 'date' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input
                    type={type || 'text'}
                    value={identityForm[key] || ''}
                    onChange={(e) => setIdentityForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['legalName', profile?.legalName],
                ['siret', profile?.siret],
                ['vatNumber', profile?.vatNumber],
                ['nafCode', profile?.nafCode],
                ['addressLine1', profile?.addressLine1],
                ['addressLine2', profile?.addressLine2],
                ['city', profile?.city],
                ['postalCode', profile?.postalCode],
                ['country', profile?.country],
                ['phone', profile?.phone],
                ['launchedAt', profile?.launchedAt],
              ].map(([key, val]) => (
                <div key={key}>
                  <dt className="text-xs font-medium text-gray-500">{t(`pos:profile.field.${key}`)}</dt>
                  <dd className="text-sm text-gray-900 mt-0.5">{val || '—'}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {/* ═══ Google Reviews Tab ═══ */}
      {activeTab === 'google' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('pos:profile.googleReviews')}</h2>
            {!editingGoogle ? (
              <Button variant="secondary" size="sm" onClick={() => setEditingGoogle(true)}>
                {t('pos:btn.edit')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditingGoogle(false)}>
                  {t('common:actions.cancel')}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveGoogle}>
                  {t('common:actions.save')}
                </Button>
              </div>
            )}
          </div>

          {editingGoogle ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'googlePlaceId', label: t('pos:profile.field.googlePlaceId') },
                { key: 'googleMapsUrl', label: t('pos:profile.field.googleMapsUrl') },
                { key: 'googleRating', label: t('pos:profile.field.googleRating'), type: 'number' },
                { key: 'googleReviewCount', label: t('pos:profile.field.googleReviewCount'), type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input
                    type={type || 'text'}
                    value={googleForm[key] || ''}
                    onChange={(e) => setGoogleForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    step={key === 'googleRating' ? '0.1' : undefined}
                    min={key === 'googleRating' ? '0' : undefined}
                    max={key === 'googleRating' ? '5' : undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {profile?.googleRating != null && (
                <div>
                  <StarRating rating={profile.googleRating} />
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.googleReviewCount || 0} {t('pos:profile.reviews')}
                  </p>
                </div>
              )}
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500">{t('pos:profile.field.googlePlaceId')}</dt>
                  <dd className="text-sm text-gray-900 mt-0.5">{profile?.googlePlaceId || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">{t('pos:profile.field.googleMapsUrl')}</dt>
                  <dd className="text-sm mt-0.5">
                    {profile?.googleMapsUrl ? (
                      <a
                        href={profile.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {t('pos:profile.viewOnMaps')}
                      </a>
                    ) : '—'}
                  </dd>
                </div>
              </dl>
              {profile?.googleReviewsUpdatedAt && (
                <p className="text-xs text-gray-400">
                  {t('pos:profile.lastUpdated')}: {new Date(profile.googleReviewsUpdatedAt).toLocaleDateString()}
                </p>
              )}

              {/* Reviews list */}
              {Array.isArray(profile?.googleReviewsJson) && profile.googleReviewsJson.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">{t('pos:profile.recentReviews')}</h3>
                  {profile.googleReviewsJson.map((review, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{review.author || t('pos:profile.anonymous')}</span>
                        {review.rating && <StarRating rating={review.rating} />}
                      </div>
                      {review.text && <p className="text-sm text-gray-600">{review.text}</p>}
                      {review.date && <p className="text-xs text-gray-400 mt-1">{review.date}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ Incidents Tab ═══ */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {/* Filters + Add button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              <select
                value={incidentFilter.status}
                onChange={(e) => setIncidentFilter((p) => ({ ...p, status: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('pos:incident.allStatuses')}</option>
                <option value="open">{t('pos:incident.status.open')}</option>
                <option value="in_progress">{t('pos:incident.status.in_progress')}</option>
                <option value="resolved">{t('pos:incident.status.resolved')}</option>
                <option value="closed">{t('pos:incident.status.closed')}</option>
              </select>
              <select
                value={incidentFilter.severity}
                onChange={(e) => setIncidentFilter((p) => ({ ...p, severity: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('pos:incident.allSeverities')}</option>
                <option value="low">{t('pos:incident.severity.low')}</option>
                <option value="medium">{t('pos:incident.severity.medium')}</option>
                <option value="high">{t('pos:incident.severity.high')}</option>
                <option value="critical">{t('pos:incident.severity.critical')}</option>
              </select>
              <select
                value={incidentFilter.category}
                onChange={(e) => setIncidentFilter((p) => ({ ...p, category: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('pos:incident.allCategories')}</option>
                {['hardware', 'software', 'connectivity', 'payment', 'power', 'safety', 'other'].map((c) => (
                  <option key={c} value={c}>{t(`pos:incident.category.${c}`)}</option>
                ))}
              </select>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIncidentModalOpen(true)}>
              + {t('pos:incident.declare')}
            </Button>
          </div>

          {/* Incidents list */}
          {incidents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <p className="text-gray-500">{t('pos:incident.noIncidents')}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 divide-y divide-gray-100">
              {incidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inc.status] || ''}`}>
                        {t(`pos:incident.status.${inc.status}`)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[inc.severity] || ''}`}>
                        {t(`pos:incident.severity.${inc.severity}`)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t(`pos:incident.category.${inc.category}`)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{inc.title}</p>
                    <p className="text-xs text-gray-500">
                      {inc.declaredByName} · {inc.declaredAt ? new Date(inc.declaredAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ History Tab ═══ */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pos:profile.history')}</h2>
          <div className="space-y-4">
            {profile?.createdAt && (
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('pos:profile.event.created')}</p>
                  <p className="text-xs text-gray-500">{new Date(profile.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )}
            {profile?.launchedAt && (
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('pos:profile.event.launched')}</p>
                  <p className="text-xs text-gray-500">{profile.launchedAt}</p>
                </div>
              </div>
            )}
            {profile?.updatedAt && (
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('pos:profile.event.updated')}</p>
                  <p className="text-xs text-gray-500">{new Date(profile.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
            {incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').map((inc) => (
              <div key={inc.id} className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t('pos:profile.event.incidentResolved')}: {inc.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString() : inc.declaredAt ? new Date(inc.declaredAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <PosModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={pos}
        mode="edit"
        managers={managers}
      />

      {/* Declare Incident Modal */}
      <DeclareIncidentModal
        isOpen={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        posId={Number(posId)}
        onCreated={handleIncidentCreated}
      />

      {/* Incident Drawer */}
      {selectedIncident && (
        <IncidentDrawer
          incident={selectedIncident}
          posId={Number(posId)}
          onClose={() => setSelectedIncident(null)}
          onUpdated={handleIncidentUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            data-testid="pos-delete-confirm-dialog"
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {t('pos:delete.title')}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {t('pos:delete.confirmPrefix')}{' '}
                <span className="font-semibold">{pos.name}</span>
                {t('pos:delete.confirmSuffix')}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirm(false)}
                data-testid="pos-delete-cancel-btn"
              >
                {t('common:actions.cancel')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                data-testid="pos-delete-confirm-btn"
              >
                {t('common:actions.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosDetailPage;
