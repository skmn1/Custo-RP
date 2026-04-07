import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const links = [
  { to: '/stock',                  key: 'nav.dashboard' },
  { to: '/stock/items',            key: 'nav.items' },
  { to: '/stock/movements',        key: 'nav.movements' },
  { to: '/stock/categories',       key: 'nav.categories' },
  { to: '/stock/locations',        key: 'nav.locations' },
  { to: '/stock/suppliers',        key: 'nav.suppliers' },
  { to: '/stock/purchase-orders',  key: 'nav.purchaseOrders' },
  { to: '/stock/stocktakes',       key: 'nav.stocktakes' },
  { to: '/stock/reorder-queue',    key: 'nav.reorder' },
];

const StockSubNav = () => {
  const { t } = useTranslation('stock');

  return (
    <nav className="mb-6 border-b border-gray-200 overflow-x-auto">
      <div className="flex space-x-1 min-w-max">
        {links.map(({ to, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/stock'}
            className={({ isActive }) =>
              `px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            {t(key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default StockSubNav;
