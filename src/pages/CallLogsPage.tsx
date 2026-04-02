import { useState, useCallback, useEffect, useRef } from 'react';
import { PhoneCall, AlertCircle, RefreshCw } from 'lucide-react';
import { FilterBar } from '../components/callLogs/FilterBar';
import { CallLogsTable } from '../components/callLogs/CallLogsTable';
import { Pagination } from '../components/callLogs/Pagination';
import { CallDetailDrawer } from '../components/callDetail/CallDetailDrawer';
import { CallDetailModal } from '../components/callDetail/CallDetailModal';
import { useCallLogs } from '../hooks/useCallLogs';
import { fetchCallDetail } from '../api/callLogs';
import type { CallLog } from '../types';

export function CallLogsPage() {
  // Filter state
  const [search, setSearch] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isMobile, setIsMobile] = useState(true);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  // Applied filters for the list API
  const [appliedFilters, setAppliedFilters] = useState({
    mobileNumber: '',
    isMobile: true,
    intents: '',
  });

  // Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ID search state — when set, bypasses the list and shows a single result
  const [idSearchResult, setIdSearchResult] = useState<CallLog[] | null>(null);
  const [idSearchLoading, setIdSearchLoading] = useState(false);
  const [idSearchError, setIdSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drawer / modal state
  const [drawerCallId, setDrawerCallId] = useState<string | null>(null);
  const [modalCallId, setModalCallId] = useState<string | null>(null);
  const [lastVisitedId, setLastVisitedId] = useState<string | null>(null);

  const activeCallId = drawerCallId ?? modalCallId;

  const { data, loading: listLoading, error: listError, refetch } = useCallLogs({
    pageNumber,
    pageSize,
    intents: appliedFilters.intents,
    mobileNumber: appliedFilters.mobileNumber,
    isMobile: appliedFilters.isMobile,
    alfursanId: '',
  });

  // Debounced ID search — calls the detail API directly
  const handleIdDebounce = useCallback((id: string) => {
    setIdSearchError(null);
    if (!id) {
      setIdSearchResult(null);
      return;
    }
    setIdSearchLoading(true);
    setIdSearchResult(null);
    fetchCallDetail(id)
      .then((detail) => {
        setIdSearchResult([detail as unknown as CallLog]);
        setIdSearchLoading(false);
      })
      .catch((err) => {
        setIdSearchResult([]);
        setIdSearchError(err.message || 'No call found with that ID');
        setIdSearchLoading(false);
      });
  }, []);

  function handleSearchChange(v: string) {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleIdDebounce(v.trim());
    }, 500);
  }

  // Clear ID search when field is emptied
  useEffect(() => {
    if (!search.trim()) {
      setIdSearchResult(null);
      setIdSearchError(null);
    }
  }, [search]);

  const applySearch = useCallback(() => {
    // If there's text in the ID box, treat Search button as "search by ID now"
    if (search.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      handleIdDebounce(search.trim());
      return;
    }
    setIdSearchResult(null);
    setAppliedFilters({
      mobileNumber,
      isMobile,
      intents: selectedIntents.join(','),
    });
    setPageNumber(0);
  }, [search, mobileNumber, isMobile, selectedIntents, handleIdDebounce]);

  const handleRefresh = useCallback(() => {
    if (search.trim()) {
      handleIdDebounce(search.trim());
    } else {
      setAppliedFilters({
        mobileNumber,
        isMobile,
        intents: selectedIntents.join(','),
      });
      refetch();
    }
  }, [search, mobileNumber, isMobile, selectedIntents, handleIdDebounce, refetch]);

  const handlePageChange = (page: number) => setPageNumber(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(0);
  };

  const handleRowClick = (id: string) => {
    setModalCallId(null);
    setDrawerCallId(id);
  };

  const handlePopupClick = (id: string) => {
    setDrawerCallId(null);
    setModalCallId(id);
  };

  const handleDrawerClose = () => {
    if (drawerCallId) setLastVisitedId(drawerCallId);
    setDrawerCallId(null);
  };

  const handleModalClose = () => {
    if (modalCallId) setLastVisitedId(modalCallId);
    setModalCallId(null);
  };

  // Decide what to show in the table
  const isIdMode = search.trim().length > 0;
  const displayLogs = isIdMode ? (idSearchResult ?? []) : (data?.content ?? []);
  const displayLoading = isIdMode ? idSearchLoading : listLoading;
  const displayError = isIdMode ? idSearchError : listError;

  return (
    <>
      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-600" />
              Call Logs
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">View call history &amp; transcripts</p>
          </div>
          {!isIdMode && data && (
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{data.totalElements.toLocaleString()}</span> total calls
            </div>
          )}
          {isIdMode && !idSearchLoading && idSearchResult && (
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{idSearchResult.length}</span> result{idSearchResult.length !== 1 ? 's' : ''} for ID search
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <FilterBar
          search={search}
          mobileNumber={mobileNumber}
          isMobile={isMobile}
          selectedIntents={selectedIntents}
          loading={displayLoading}
          onSearchChange={handleSearchChange}
          onMobileNumberChange={setMobileNumber}
          onIsMobileChange={setIsMobile}
          onIntentsChange={setSelectedIntents}
          onSearch={applySearch}
          onRefresh={handleRefresh}
        />

        {/* Error Banner */}
        {displayError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm flex-1">{displayError}</span>
            {!isIdMode && (
              <button
                onClick={refetch}
                className="flex items-center gap-1.5 text-sm font-medium hover:text-red-900 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <CallLogsTable
          logs={displayLogs}
          loading={displayLoading}
          pageNumber={pageNumber}
          pageSize={pageSize}
          activeCallId={activeCallId}
          lastVisitedId={lastVisitedId}
          onRowClick={handleRowClick}
          onPopupClick={handlePopupClick}
        />

        {/* Pagination — hidden when in ID search mode */}
        {!isIdMode && data && data.totalPages > 0 && (
          <Pagination
            currentPage={pageNumber}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Sidebar drawer */}
      <CallDetailDrawer
        callId={drawerCallId}
        onClose={handleDrawerClose}
      />

      {/* Center popup modal */}
      <CallDetailModal
        callId={modalCallId}
        onClose={handleModalClose}
      />
    </>
  );
}
