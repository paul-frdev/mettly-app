'use client';

import { Search } from 'lucide-react';

interface ClientSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export default function ClientSearch({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: ClientSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search clients..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="flex-shrink-0">
        <div className="relative inline-block text-left">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New</option>
          </select>
        </div>
      </div>
    </div>
  );
} 