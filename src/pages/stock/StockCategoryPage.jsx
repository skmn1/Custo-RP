import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStock } from '../../hooks/useStock';

const StockCategoryPage = () => {
  const { t, i18n } = useTranslation(['stock', 'common']);
  const lang = i18n.language;
  const { categories, categoriesFlat, isLoading, fetchCategories, fetchCategoriesFlat, createCategory, updateCategory, deleteCategory } = useStock();

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nameEn: '', nameFr: '', parentId: '', sortOrder: 0 });

  useEffect(() => { fetchCategories(); fetchCategoriesFlat(); }, [fetchCategories, fetchCategoriesFlat]);

  const resetForm = () => { setEditing(null); setForm({ nameEn: '', nameFr: '', parentId: '', sortOrder: 0 }); };

  const startEdit = (cat) => {
    setEditing(cat.id);
    setForm({ nameEn: cat.nameEn, nameFr: cat.nameFr, parentId: cat.parentId || '', sortOrder: cat.sortOrder || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, parentId: form.parentId || null, sortOrder: Number(form.sortOrder) };
    if (editing) {
      await updateCategory(editing, data);
    } else {
      await createCategory(data);
    }
    resetForm();
    fetchCategories();
    fetchCategoriesFlat();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('categories.confirmDelete'))) return;
    await deleteCategory(id);
    fetchCategories();
    fetchCategoriesFlat();
  };

  const renderTree = (nodes, depth = 0) =>
    nodes.map((cat) => (
      <React.Fragment key={cat.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm" style={{ paddingLeft: `${16 + depth * 24}px` }}>
            {depth > 0 && <span className="text-gray-400 mr-1">{'└'}</span>}
            {lang === 'fr' ? cat.nameFr : cat.nameEn}
          </td>
          <td className="px-4 py-3 text-sm text-gray-500">{cat.sortOrder}</td>
          <td className="px-4 py-3 text-sm text-right space-x-2">
            <button onClick={() => startEdit(cat)} className="text-indigo-600 hover:text-indigo-900 text-sm">{t('common:edit')}</button>
            <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 text-sm">{t('common:delete')}</button>
          </td>
        </tr>
        {cat.children && cat.children.length > 0 && renderTree(cat.children, depth + 1)}
      </React.Fragment>
    ));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('categories.title')}</h1>
        <p className="text-sm text-gray-500">{t('categories.subtitle')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold">{editing ? t('categories.form.editTitle') : t('categories.form.addTitle')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('categories.form.nameEn')}</label>
            <input required type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('categories.form.nameFr')}</label>
            <input required type="text" value={form.nameFr} onChange={(e) => setForm({ ...form, nameFr: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('categories.form.parent')}</label>
            <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2">
              <option value="">{t('categories.form.noParent')}</option>
              {categoriesFlat.filter((c) => c.id !== editing).map((c) => (
                <option key={c.id} value={c.id}>{lang === 'fr' ? c.nameFr : c.nameEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('categories.form.sortOrder')}</label>
            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm border px-3 py-2" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
            {editing ? t('common:save') : t('common:create')}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              {t('common:cancel')}
            </button>
          )}
        </div>
      </form>

      {/* Tree table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">{t('common:loading')}</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t('categories.empty')}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('categories.col.name')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('categories.col.sortOrder')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('categories.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {renderTree(categories)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockCategoryPage;
