
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingCart, 
  History, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  FileDown, 
  Calendar, 
  Plus, 
  X, 
  BadgeDollarSign, 
  Tag, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const Sales: React.FC = () => {
  const { hijabProducts, recordSale, hijabSales } = useApp();
  
  // State for Sales History Table
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // State for New Sale Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProduct = hijabProducts.find(p => p.id === selectedProductId);

  // --- Table Logic ---
  const filteredSales = useMemo(() => {
    return hijabSales.filter(sale => 
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [hijabSales, searchTerm]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  // --- Modal Logic ---
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setErrorMessage(null);
    // Reset form
    setSelectedProductId('');
    setQuantity(1);
    setTrackingNumber('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowConfirm(false);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMessage(null);
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    if (!selectedProduct) return;
    try {
      await recordSale({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        trackingNumber,
        date
      });
      
      handleCloseModal();
      alert('Transaction saved successfully!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction failed. Please try again.');
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <BadgeDollarSign className="text-indigo-600" size={24} />
            Sales Management
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">Track retail activity and inventory depletion</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search Invoice / SKU..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-50 w-full transition-all"
            />
          </div>
          <button 
            onClick={handleOpenModal}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> New Transaction
          </button>
        </div>
      </div>

      {/* SALES HISTORY TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="px-8 py-5">Date & Invoice</th>
                <th className="px-8 py-5">Product Details</th>
                <th className="px-8 py-5">Quantity</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center opacity-40">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-black uppercase tracking-widest">No Sales Recorded Yet</p>
                  </td>
                </tr>
              ) : (
                paginatedSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Calendar size={16} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-800">{new Date(sale.date).toLocaleDateString()}</p>
                            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">{sale.trackingNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-slate-700">{sale.productName}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-900">{sale.quantity} pcs</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Showing Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* NEW TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 relative">
            <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest leading-none">Record Sale</h3>
                <p className="text-indigo-100 text-[9px] font-black uppercase tracking-widest mt-1 opacity-80">Retail Transaction Form</p>
              </div>
              <button onClick={handleCloseModal} className="hover:bg-white/20 p-2 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                  <AlertCircle size={18} /> {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product SKU</label>
                  <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 font-bold transition-all text-sm"
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {hijabProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.color}) - Stock: {p.stock} pcs</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity Sold</label>
                    <input 
                      type="number"
                      min="1"
                      max={selectedProduct?.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 font-bold transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 font-bold transition-all text-sm uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Number</label>
                  <div className="relative">
                    <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      type="text"
                      placeholder="e.g. INV/ZH/001"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 font-bold transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {selectedProduct && selectedProduct.stock < quantity && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase">
                  <AlertCircle size={16} /> Not enough stock available
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={!selectedProductId || (selectedProduct && selectedProduct.stock < quantity)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40"
                >
                  Verify Transaction
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <ShieldCheck size={12} /> Secure Inventory Log
              </div>
            </form>

            {/* CONFIRMATION OVERLAY (INNER) */}
            {showConfirm && (
              <div className="absolute inset-0 z-[110] bg-white/95 backdrop-blur-sm flex items-center justify-center p-10 text-center animate-in fade-in duration-200">
                <div className="max-w-xs space-y-6">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart size={36} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Confirm Transaction?</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Recording <span className="font-black text-indigo-600">{quantity} units</span> of <span className="font-black text-slate-800">{selectedProduct?.name}</span>. This will immediately update your inventory status.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowConfirm(false)} className="py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Go Back</button>
                    <button onClick={confirmSubmit} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Proceed</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
