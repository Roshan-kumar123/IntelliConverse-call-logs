import { PhoneCall } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-base tracking-tight">
            IntelliConverse
          </span>
          <span className="text-gray-300 text-sm mx-1">|</span>
          <span className="text-gray-500 text-sm">Analytics</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-500">All Systems Operational</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center select-none">
            NN
          </div>
        </div>
      </div>
    </header>
  );
}
