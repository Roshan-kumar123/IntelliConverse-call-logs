import { useState } from 'react';
import { UserCheck, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useHumanTransfer } from '../../hooks/useHumanTransfer';

const TRANSFER_REASON = 'Supervisor transfer';
const TRANSFER_INTENT = 'FlightStatus';

interface HumanTransferButtonProps {
  roomId: string;
}

export function HumanTransferButton({ roomId }: HumanTransferButtonProps) {
  const { transfer, transferring, transferError, transferSuccess } = useHumanTransfer(roomId);
  const [showError, setShowError] = useState(false);

  async function handleClick() {
    setShowError(false);
    await transfer(TRANSFER_REASON, TRANSFER_INTENT);
    setShowError(true);
  }

  if (transferSuccess) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg">
        <CheckCircle className="w-3.5 h-3.5" />
        Transferred
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showError && transferError && (
        <span className="inline-flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5" />
          {transferError}
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={transferring}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
      >
        {transferring ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <UserCheck className="w-3.5 h-3.5" />
        )}
        Human Transfer
      </button>
    </div>
  );
}
