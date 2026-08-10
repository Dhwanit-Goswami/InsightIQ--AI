import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumb = ({ items = [] }) => {
  const allItems = [{ label: 'Home', path: '/dashboard' }, ...items];

  return (
    <nav className="flex items-center gap-1 text-sm">
      {allItems.map((item, index) => (
        <React.Fragment key={item.path || index}>
          {index > 0 && <FiChevronRight className="w-3.5 h-3.5 text-slate-600" />}
          {index === allItems.length - 1 ? (
            <span className="text-white font-medium">{item.label}</span>
          ) : (
            <Link
              to={item.path}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {index === 0 ? <FiHome className="w-4 h-4" /> : item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
