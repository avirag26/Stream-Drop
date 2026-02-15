import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  title?: string;
  items: SidebarItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ title = 'ACCOUNT SETTINGS', items }) => {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
        {title}
      </h3>
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
