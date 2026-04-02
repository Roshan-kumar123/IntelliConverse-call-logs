import { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, ChevronDown, X } from 'lucide-react';
import { INTENT_OPTIONS } from '../../config';

interface FilterBarProps {
  search: string;
  mobileNumber: string;
  isMobile: boolean;
  selectedIntents: string[];
  loading: boolean;
  onSearchChange: (v: string) => void;
  onMobileNumberChange: (v: string) => void;
  onIsMobileChange: (v: boolean) => void;
  onIntentsChange: (v: string[]) => void;
  onSearch: () => void;
  onRefresh: () => void;
}

export function FilterBar({
  search,
  mobileNumber,
  isMobile,
  selectedIntents,
  loading,
  onSearchChange,
  onMobileNumberChange,
  onIsMobileChange,
  onIntentsChange,
  onSearch,
  onRefresh,
}: FilterBarProps) {
  const [intentOpen, setIntentOpen] = useState(false);
  const intentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (intentRef.current && !intentRef.current.contains(e.target as Node)) {
        setIntentOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleIntent(value: string) {
    if (selectedIntents.includes(value)) {
      onIntentsChange(selectedIntents.filter((v) => v !== value));
    } else {
      onIntentsChange([...selectedIntents, value]);
    }
  }

  function clearIntents() {
    onIntentsChange([]);
  }

  const intentLabel =
    selectedIntents.length === 0
      ? 'Filter by Intent'
      : selectedIntents.length === 1
        ? (INTENT_OPTIONS.find((o) => o.value === selectedIntents[0])?.label ?? '1 selected')
        : `${selectedIntents.length} selected`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Mobile Number */}
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Mobile Number"
            value={mobileNumber}
            onChange={(e) => onMobileNumberChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Search className="w-4 h-4" />
          Search
        </button>

        <div className="h-7 w-px bg-gray-200" />

        {/* Is Mobile Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={isMobile}
            onClick={() => onIsMobileChange(!isMobile)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isMobile ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                isMobile ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">Is Mobile</span>
        </label>

        {/* Intent Filter */}
        <div className="relative" ref={intentRef}>
          <button
            onClick={() => setIntentOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-44 justify-between"
          >
            <span className={selectedIntents.length > 0 ? 'text-blue-700 font-medium' : 'text-gray-500'}>
              {intentLabel}
            </span>
            <div className="flex items-center gap-1">
              {selectedIntents.length > 0 && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); clearIntents(); }}
                  className="p-0.5 rounded hover:bg-gray-200"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${intentOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {intentOpen && (
            <div className="absolute top-full mt-1 right-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 max-h-64 overflow-y-auto">
              {INTENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIntents.includes(opt.value)}
                    onChange={() => toggleIntent(opt.value)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh"
          className="p-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
