
import React, { useState, useMemo, Suspense, lazy, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ChevronLeft, ChevronRight, Plus, BadgeDollarSign } from 'lucide-react';

// Lazy load modal untuk mengurangi beban runtime halaman Sales
const SalesTransactionModal = lazy(() => import('./components/SalesTransactionModal'));

const SaleRow = memo(({ sale }: { sale: any }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-8 py-5">
      <p className="text-[11px] font-black text-slate-800">{new Date(sale.date).toLocaleDateString()}</p>
      <p className="text-[9px] font-bold text-indigo-400 uppercase">{sale.trackingNumber}</p>
    </td>
    <td className="px-8 py-5 text-sm font-medium text-slate-700">{sale.productName}</td>
    <td className="px-8 py-5 text-base font-semibold text-slate-900">{sale.quantity} pcs</td>
    <td className="px-8 py-5 text-right">
      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium uppercase">Completed</span>
    </td>
  </tr>
));

export const Sales: React.FC = () => {
  const { hijabSales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 8;

  const filteredSales = useMemo(() => 
    hijabSales.filter(sale => 
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ), [hijabSales, searchTerm]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  
  const paginatedSales = useMemo(() => 
    filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  , [filteredSales, currentPage]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <BadgeDollarSign className="text-slate-900" size={24} />
            Sales Management
          </h3>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              className="pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-lg text-[11px] font-black uppercase"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-lg text-xs font-medium uppercase tracking-widest shadow-xl shadow-indigo-100">
            <Plus size={16} className="inline mr-2" /> New Sale
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden h-[600px] flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-medium text-slate-400 uppercase border-b sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5">Date & Invoice</th>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Qty</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center opacity-40 uppercase font-black text-xs">No Records</td>
                </tr>
              ) : (
                paginatedSales.map(sale => (
                  <SaleRow key={sale.id} sale={sale} />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 border-t flex justify-between items-center bg-slate-50/50">
           <span className="text-xs font-medium text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
           <div className="flex gap-2">
             <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2 rounded-xl border bg-white disabled:opacity-30 transition-opacity"><ChevronLeft size={16}/></button>
             <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl border bg-white disabled:opacity-30 transition-opacity"><ChevronRight size={16}/></button>
           </div>
        </div>
      </div>

      <Suspense fallback={null}>
        {isModalOpen && <SalesTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </Suspense>
    </div>
  );
};
