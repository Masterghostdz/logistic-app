
import React from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter } from 'lucide-react';

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
  searchPlaceholder = 'Rechercher...',
  filterPlaceholder = 'Filtrer...'
}: SearchAndFilterProps) => {
  return (
    <div className="flex gap-4 mb-4">
      <div className="relative w-2/3 flex items-center">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        <Select value={searchColumn} onValueChange={onSearchColumnChange}>
          <SelectTrigger className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 border-none bg-transparent">
            <Search className="h-4 w-4 text-gray-400" />
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
        <SelectTrigger className="w-1/3 min-w-[80px] md:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder={filterPlaceholder} />
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
