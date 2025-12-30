
import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, RequestStatus } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Package, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Ban, 
  Upload, 
  X, 
  ImageIcon, 
  AlertCircle,
  History as HistoryIcon
} from 'lucide-react';

export const History: React.FC = () => {
  const { requests, user, updateRequestStatus, uploadPaymentProof } = useApp();
  const isUMKM = user?.role === UserRole.UMKM;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);
  const [tempProof, setTempProof] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const historyData = useMemo(() => {
    return requests.filter(r => isUMKM ? r.umkmId === user.id : r.supplierId === user?.id);
  }, [requests, user?.id, isUMKM]);

  const filteredHistory = useMemo(() => {
    return historyData.filter(req => 
      req.fabricName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyData, searchTerm]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempProof(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (uploadingRequestId && tempProof) {
      await uploadPaymentProof(uploadingRequestId, tempProof);
      setUploadingRequestId(null);
      setTempProof(null);
    }
  };

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.COMPLETED: return { color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} className="mr-1" /> };
      case RequestStatus.REJECTED: 
      case RequestStatus.CANCELLED: return { color: 'bg-rose-100 text-rose-700', icon: <XCircle size={12} className="mr-1" /> };
      case RequestStatus.SHIPPED: return { color: 'bg-blue-100 text-blue-700', icon: <Truck size={12} className="mr-1" /> };
      case RequestStatus.APPROVED: return { color: 'bg-indigo-100 text-indigo-700', icon: <CheckCircle size={12} className="mr-1" /> };
      case RequestStatus.WAITING_VERIFICATION: return { color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} className="mr-1" /> };
      default: return { color: 'bg-slate-100 text-slate-700', icon: <Clock size={12} className="mr-1" /> };
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <HistoryIcon className="text-indigo-600" size={24} />
            Order History
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">Log of all procurement requests and fulfillment status</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search orders..."
            className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none w-full md:w-80 transition-all font-bold text-xs"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase border-b">
                <th className="px-8 py-5 w-[15%]">Date</th>
                <th className="px-8 py-5 w-[25%]">{isUMKM ? 'Supplier' : 'UMKM'}</th>
                <th className="px-8 py-5 w-[25%]">Material</th>
                <th className="px-8 py-5 w-[10%] text-center">Qty</th>
                <th className="px-8 py-5 w-[15%]">Status</th>
                <th className="px-8 py-5 w-[10%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-24 text-center text-slate-400 font-bold uppercase text-xs opacity-30">No matching records</td></tr>
              ) : (
                paginatedHistory.map((req) => {
                  const config = getStatusConfig(req.status);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors h-[68px]">
                      <td className="px-8 py-5 text-[11px] font-black text-slate-700">{new Date(req.timestamp).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-800 truncate">{isUMKM ? req.supplierName : req.umkmName}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-700 truncate">{req.fabricName}</td>
                      <td className="px-8 py-5 text-xs font-black text-slate-900 text-center">{req.quantity}m</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${config.color}`}>
                          {config.icon} {req.status === RequestStatus.WAITING_VERIFICATION ? 'Verify Payment' : req.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {isUMKM && req.status === RequestStatus.PENDING && (
                          <button 
                            onClick={() => setUploadingRequestId(req.id)}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
                            title="Upload Payment Proof"
                          >
                            <Upload size={14} />
                          </button>
                        )}
                        {isUMKM && req.status === RequestStatus.SHIPPED && (
                          <button 
                            onClick={() => updateRequestStatus(req.id, RequestStatus.COMPLETED)}
                            className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[9px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl border bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* UPLOAD PROOF MODAL */}
      {uploadingRequestId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Payment Proof</span>
                <button onClick={() => { setUploadingRequestId(null); setTempProof(null); }} className="hover:bg-white/20 p-1.5 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[2rem] p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-48 ${tempProof ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {tempProof ? <img src={tempProof} className="h-full w-full object-contain rounded-xl" alt="Preview" /> : (
                        <>
                            <ImageIcon size={32} className="text-slate-300 mb-2" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Click to Select Receipt</span>
                        </>
                    )}
                </div>
                <div className="flex gap-2 text-[10px] text-slate-400 italic font-medium"><AlertCircle size={14} className="shrink-0" /> Upload transfer receipt to start verification.</div>
                <button 
                    onClick={handleUploadSubmit}
                    disabled={!tempProof}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-40 transition-all active:scale-95 shadow-xl shadow-indigo-100"
                >
                    Submit Proof
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
