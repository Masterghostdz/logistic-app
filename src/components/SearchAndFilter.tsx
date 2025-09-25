import React from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: { value: string; label: string }[];
  searchColumn: string;
  onSearchColumnChange: (value: string) => void;
  searchColumnOptions: { value: string; label: string }[];
  searchPlaceholder?: string;
  filterPlaceholder?: string;
}

const SearchAndFilter = ({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  searchColumn,
  onSearchColumnChange,
  searchColumnOptions,
  searchPlaceholder,
  filterPlaceholder
}: SearchAndFilterProps) => {
  const { t } = useTranslation();
  const finalSearchPlaceholder = searchPlaceholder || t('common.searchPlaceholder') || t('searchPlaceholder') || 'Rechercher...';
  const finalFilterPlaceholder = filterPlaceholder || t('common.filterPlaceholder') || t('filterPlaceholder') || 'Filtrer...';
  return (
    <div className="flex gap-4 mb-4 items-center">
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={finalSearchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        <Select value={searchColumn} onValueChange={onSearchColumnChange}>
          {/* Hide the built-in icon and render a centered slightly larger chevron for better alignment */}
          <SelectTrigger data-hide-icon className="absolute right-2 top-1/2 transform -translate-y-1/2 flex-none w-8 h-8 p-0 border-none bg-transparent flex items-center justify-center">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </SelectTrigger>
          <SelectContent>
            {searchColumnOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Select value={filterValue} onValueChange={onFilterChange}>
        <SelectTrigger className="flex-none min-w-[80px] md:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder={finalFilterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {filterOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchAndFilter;
