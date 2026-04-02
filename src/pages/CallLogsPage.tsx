import { useState, useCallback } from 'react';
import { PhoneCall, AlertCircle, RefreshCw } from 'lucide-react';
import { FilterBar } from '../components/callLogs/FilterBar';
import { CallLogsTable } from '../components/callLogs/CallLogsTable';
import { Pagination } from '../components/callLogs/Pagination';
import { CallDetailDrawer } from '../components/callDetail/CallDetailDrawer';
import { CallDetailModal } from '../components/callDetail/CallDetailModal';
import { useCallLogs } from '../hooks/useCallLogs';

export function CallLogsPage() {
  // Filter state
  const [search, setSearch] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isMobile, setIsMobile] = useState(true);
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  // Applied (committed) filter state — only changes on Search/Refresh
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    mobileNumber: '',
    isMobile: true,
    intents: '',
  });

  // Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Drawer state: ID of call currently open in sidebar
  const [drawerCallId, setDrawerCallId] = useState<string | null>(null);
  // Modal state: ID of call currently open in popup
  const [modalCallId, setModalCallId] = useState<string | null>(null);
  // Last visited: highlighted row after close (whichever was closed last)
  const [lastVisitedId, setLastVisitedId] = useState<string | null>(null);

  // The "active" id is whichever is currently open (drawer takes priority for row highlight)
  const activeCallId = drawerCallId ?? modalCallId;

  const { data, loading, error, refetch } = useCallLogs({
    pageNumber,
    pageSize,
    intents: appliedFilters.intents,
    mobileNumber: appliedFilters.mobileNumber,
    isMobile: appliedFilters.isMobile,
    alfursanId: '',
  });

  const applySearch = useCallback(() => {
    setAppliedFilters({
      search,
      mobileNumber,
      isMobile,
      intents: selectedIntents.join(','),
    });
    setPageNumber(0);
  }, [search, mobileNumber, isMobile, selectedIntents]);

  const handleRefresh = useCallback(() => {
    applySearch();
    refetch();
  }, [applySearch, refetch]);

  const handlePageChange = (page: number) => setPageNumber(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(0);
  };

  // Row click (or eye icon) → open sidebar drawer
  const handleRowClick = (id: string) => {
    setModalCallId(null);
    setDrawerCallId(id);
  };

  // Popup icon → open center modal
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
          {data && (
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{data.totalElements.toLocaleString()}</span> total calls
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <FilterBar
          search={search}
          mobileNumber={mobileNumber}
          isMobile={isMobile}
          selectedIntents={selectedIntents}
          loading={loading}
          onSearchChange={setSearch}
          onMobileNumberChange={setMobileNumber}
          onIsMobileChange={setIsMobile}
          onIntentsChange={setSelectedIntents}
          onSearch={applySearch}
          onRefresh={handleRefresh}
        />

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm flex-1">{error}</span>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-sm font-medium hover:text-red-900 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <CallLogsTable
          logs={data?.content ?? []}
          loading={loading}
          pageNumber={pageNumber}
          pageSize={pageSize}
          activeCallId={activeCallId}
          lastVisitedId={lastVisitedId}
          onRowClick={handleRowClick}
          onPopupClick={handlePopupClick}
        />

        {/* Pagination */}
        {data && data.totalPages > 0 && (
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
