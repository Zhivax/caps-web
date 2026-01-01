
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Clock, ChevronLeft, ChevronRight, Search, FileText as HistoryIcon } from 'lucide-react';

export const UsageHistory: React.FC = () => {
  const { usageHistory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredHistory = usageHistory.filter(h => 
    h.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.fabricName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedData = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <HistoryIcon className="text-slate-900" size={24} />
            Consumption History
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-9">Audit trail of materials used in production batches</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-lg outline-none w-full md:w-80 font-bold text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[580px]">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase tracking-[0.2em] border-b">
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Product Target</th>
                <th className="px-8 py-5">Material Used</th>
                <th className="px-8 py-5">Produced</th>
                <th className="px-8 py-5 text-right">Consumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-40">No activity recorded</td>
                </tr>
              ) : (
                paginatedData.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span className="text-[11px] font-black">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-slate-800">{log.productName}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-500">{log.fabricName}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-green-600">{log.quantityProduced} pcs</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-base font-semibold text-slate-900">-{log.fabricUsed.toFixed(1)}m</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border bg-white disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl border bg-white disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
