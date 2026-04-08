import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import DeclareIncidentModal from '../components/pos/DeclareIncidentModal';
import IncidentDrawer from '../components/pos/IncidentDrawer';
import { posApi } from '../api/posApi';

const TABS = ['identity', 'google', 'incidents', 'history'];

const StarRating = ({ rating }) => {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${
            i <= full ? 'text-yellow-400' : i === full + 1 && half ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {i <= full ? (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          ) : i === full + 1 && half ? (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          ) : (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          )}
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

const PosProfilePage = () => {
  const { t } = useTranslation(['pos', 'common']);
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [googleForm, setGoogleForm] = useState({});
  const [editingGoogle, setEditingGoogle] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentFilter, setIncidentFilter] = useState({ status: '', category: '', severity: '' });

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await posApi.getProfile(id);
      setProfile(data);
      setFormData({
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
        siret: data.siret || '',
        vatNumber: data.vatNumber || '',
        nafCode: data.nafCode || '',
        legalName: data.legalName || '',
        launchedAt: data.launchedAt || '',
        phone: data.phone || '',
      });
      setGoogleForm({
        googlePlaceId: data.googlePlaceId || '',
        googleMapsUrl: data.googleMapsUrl || '',
        googleRating: data.googleRating != null ? String(data.googleRating) : '',
        googleReviewCount: data.googleReviewCount != null ? String(data.googleReviewCount) : '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await posApi.listIncidents(id, incidentFilter);
      setIncidents(data);
    } catch {
      // non-blocking
    }
  }, [id, incidentFilter]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleSaveProfile = async () => {
    try {
      const updated = await posApi.updateProfile(id, formData);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
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
      const updated = await posApi.updateGoogleReviews(id, payload);
      setProfile(updated);
      setEditingGoogle(false);
    } catch (err) {
      setError(err.message || 'Failed to save Google reviews');
    }
  };

  const handleIncidentCreated = async () => {
    setIncidentModalOpen(false);
    await fetchIncidents();
    await fetchProfile();
  };

  const handleIncidentUpdated = async () => {
    setSelectedIncident(null);
    await fetchIncidents();
    await fetchProfile();
  };

  if (isLoading && !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="primary" onClick={() => navigate(`/pos/${id}`)}>
          {t('pos:detail.back')}
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/pos/${id}`)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            {t('pos:detail.back')}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-sm text-gray-500">{t('pos:profile.title')}</p>
          </div>
        </div>
        {profile.openIncidentsCount > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {profile.openIncidentsCount} {t('pos:profile.openIncidents')}
          </span>
        )}
      </div>

      {/* Photo + Quick info */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6 flex gap-6">
        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0 overflow-hidden">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            '🏪'
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-gray-600">
            📍 {profile.address}
          </p>
          {profile.phone && (
            <p className="text-sm text-gray-600">📞 {profile.phone}</p>
          )}
          <p className="text-sm text-gray-600">
            👤 {profile.managerName || t('pos:detail.unassigned')}
          </p>
          {profile.googleRating != null && (
            <div className="flex items-center gap-2 pt-1">
              <StarRating rating={profile.googleRating} />
              {profile.googleReviewCount != null && (
                <span className="text-xs text-gray-500">
                  ({profile.googleReviewCount} {t('pos:profile.reviews')})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`pos:profile.tab.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'identity' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('pos:profile.identity')}</h2>
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                {t('pos:btn.edit')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  {t('common:actions.cancel')}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                  {t('common:actions.save')}
                </Button>
              </div>
            )}
          </div>

          {editing ? (
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
                    value={formData[key] || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['legalName', profile.legalName],
                ['siret', profile.siret],
                ['vatNumber', profile.vatNumber],
                ['nafCode', profile.nafCode],
                ['addressLine1', profile.addressLine1],
                ['addressLine2', profile.addressLine2],
                ['city', profile.city],
                ['postalCode', profile.postalCode],
                ['country', profile.country],
                ['phone', profile.phone],
                ['launchedAt', profile.launchedAt],
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
              {profile.googleRating != null && (
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
                  <dd className="text-sm text-gray-900 mt-0.5">{profile.googlePlaceId || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">{t('pos:profile.field.googleMapsUrl')}</dt>
                  <dd className="text-sm mt-0.5">
                    {profile.googleMapsUrl ? (
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
              {profile.googleReviewsUpdatedAt && (
                <p className="text-xs text-gray-400">
                  {t('pos:profile.lastUpdated')}: {new Date(profile.googleReviewsUpdatedAt).toLocaleDateString()}
                </p>
              )}

              {/* Reviews list */}
              {Array.isArray(profile.googleReviewsJson) && profile.googleReviewsJson.length > 0 && (
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

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pos:profile.history')}</h2>
          <div className="space-y-4">
            {profile.createdAt && (
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('pos:profile.event.created')}</p>
                  <p className="text-xs text-gray-500">{new Date(profile.createdAt).toLocaleString()}</p>
                </div>
              </div>
            )}
            {profile.launchedAt && (
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('pos:profile.event.launched')}</p>
                  <p className="text-xs text-gray-500">{profile.launchedAt}</p>
                </div>
              </div>
            )}
            {profile.updatedAt && (
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

      {/* Declare Incident Modal */}
      <DeclareIncidentModal
        isOpen={incidentModalOpen}
        onClose={() => setIncidentModalOpen(false)}
        posId={Number(id)}
        onCreated={handleIncidentCreated}
      />

      {/* Incident Drawer */}
      {selectedIncident && (
        <IncidentDrawer
          incident={selectedIncident}
          posId={Number(id)}
          onClose={() => setSelectedIncident(null)}
          onUpdated={handleIncidentUpdated}
        />
      )}
    </div>
  );
};

export default PosProfilePage;
