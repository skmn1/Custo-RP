import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RectangleGroupIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { hrApi } from '../../api/hrApi';

/* ─────────────────────────────── helpers ─── */

function flatten(node, result = []) {
  result.push(node);
  (node.children || []).forEach((c) => flatten(c, result));
  return result;
}

/* ─────────────────────────────── OrgNode ─── */

function OrgNode({ node, searchTerm, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const matchesSearch =
    searchTerm &&
    (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const highlight = (text) => {
    if (!searchTerm) return text;
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">
          {text.slice(idx, idx + searchTerm.length)}
        </mark>
        {text.slice(idx + searchTerm.length)}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative flex flex-col items-center rounded-xl border px-4 py-3 min-w-[160px] max-w-[200px] shadow-sm transition-all ${
          matchesSearch
            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-yellow-300'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mb-2 ${
            node.color || 'bg-indigo-500'
          }`}
        >
          {node.avatar || node.name.slice(0, 2).toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center leading-tight">
          {highlight(node.name)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-0.5">
          {highlight(node.jobTitle || node.role || '')}
        </p>
        {node.department && (
          <span className="mt-1.5 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {node.department}
          </span>
        )}
        {/* Collapse toggle */}
        {hasChildren && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow hover:bg-indigo-600 transition-colors z-10"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="mt-6 flex flex-row gap-6 relative">
          {/* Horizontal connector line */}
          {node.children.length > 1 && (
            <div
              className="absolute top-0 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600"
              style={{ top: 0 }}
            />
          )}
          {node.children.map((child) => (
            <div key={child.id} className="flex flex-col items-center">
              {/* Vertical connector from parent */}
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 -mt-6 mb-0 self-center" />
              <OrgNode node={child} searchTerm={searchTerm} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── OrgChartPage ─── */

const OrgChartPage = () => {
  const { t } = useTranslation('common');
  const chartRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    hrApi
      .orgChart()
      .then((data) => setNodes(Array.isArray(data) ? data : [data]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const totalCount = nodes.reduce((sum, root) => sum + flatten(root).length, 0);
  const matchCount = searchTerm
    ? nodes.reduce(
        (sum, root) =>
          sum +
          flatten(root).filter(
            (n) =>
              n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (n.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()),
          ).length,
        0,
      )
    : null;

  const handleExport = useCallback(async () => {
    const el = chartRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = 'org-chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('html2canvas is not installed. Run: npm install html2canvas');
    }
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <RectangleGroupIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('nav.orgChart')}
            </h1>
            {!loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} {totalCount === 1 ? 'employee' : 'employees'}
                {matchCount !== null && ` · ${matchCount} match${matchCount === 1 ? '' : 'es'}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or title…"
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-56"
            />
          </div>
          {/* Export PNG */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
          <RectangleGroupIcon className="w-12 h-12 mb-3" />
          <p>No org chart data found.</p>
        </div>
      )}

      {!loading && !error && nodes.length > 0 && (
        <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-8">
          <div ref={chartRef} className="flex flex-row gap-16 justify-center pb-6 min-w-max">
            {nodes.map((root) => (
              <OrgNode key={root.id} node={root} searchTerm={searchTerm} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgChartPage;
