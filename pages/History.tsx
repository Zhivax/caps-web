
import React, { useState, useMemo, useRef, memo } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, RequestStatus, FabricRequest } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  X, 
  ImageIcon, 
  AlertCircle,
  History as HistoryIcon
} from 'lucide-react';
import { ViewportAware } from '../components/ViewportAware';

const StatusBadge = memo(({ status }: { status: RequestStatus }) => {
  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.COMPLETED: return { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={12} className="mr-1" />, label: 'Selesai' };
      case RequestStatus.REJECTED: return { color: 'bg-red-100 text-red-700', icon: <XCircle size={12} className="mr-1" />, label: 'Ditolak' };
      case RequestStatus.CANCELLED: return { color: 'bg-red-100 text-red-700', icon: <XCircle size={12} className="mr-1" />, label: 'Dibatalkan' };
      case RequestStatus.SHIPPED: return { color: 'bg-blue-100 text-blue-700', icon: <Truck size={12} className="mr-1" />, label: 'Dikirim' };
      case RequestStatus.APPROVED: return { color: 'bg-indigo-100 text-indigo-700', icon: <CheckCircle2 size={12} className="mr-1" />, label: 'Disetujui' };
      case RequestStatus.WAITING_VERIFICATION: return { color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} className="mr-1" />, label: 'Verifikasi Pembayaran' };
      case RequestStatus.PENDING: return { color: 'bg-slate-100 text-slate-700', icon: <Clock size={12} className="mr-1" />, label: 'Tertunda' };
      default: return { color: 'bg-slate-100 text-slate-700', icon: <Clock size={12} className="mr-1" />, label: status };
    }
  };
  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
});

const HistoryRow = memo(({ 
  req, 
  isUMKM, 
  onUpload, 
  onComplete 
}: { 
  req: FabricRequest; 
  isUMKM: boolean; 
  onUpload: (id: string) => void;
  onComplete: (id: string) => void;
}) => (
  <tr className="hover:bg-slate-50/50 transition-colors h-[68px]">
    <td className="px-8 py-5 text-[11px] font-black text-slate-700">{new Date(req.timestamp).toLocaleDateString()}</td>
    <td className="px-8 py-5 text-xs font-bold text-slate-800 truncate">{isUMKM ? req.supplierName : req.umkmName}</td>
    <td className="px-8 py-5 text-xs font-bold text-slate-700 truncate">{req.fabricName}</td>
    <td className="px-8 py-5 text-sm font-medium text-slate-900 text-center">{req.quantity}m</td>
    <td className="px-8 py-5">
      <StatusBadge status={req.status} />
    </td>
    <td className="px-8 py-5 text-right">
      <div className="flex justify-end gap-2">
        {isUMKM && req.status === RequestStatus.PENDING && (
          <button 
            onClick={() => onUpload(req.id)}
            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <Upload size={14} />
          </button>
        )}
        {isUMKM && req.status === RequestStatus.SHIPPED && (
          <button 
            onClick={() => onComplete(req.id)}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md active:scale-95"
          >
            <CheckCircle2 size={14} />
          </button>
        )}
      </div>
    </td>
  </tr>
));

export const History: React.FC = () => {
  const { requests, user, updateRequestStatus, uploadPaymentProof } = useApp();
  const isUMKM = user?.role === UserRole.UMKM;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);
  const [tempProof, setTempProof] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const historyData = useMemo(() => 
    requests.filter(r => isUMKM ? r.umkmId === user?.id : r.supplierId === user?.id)
  , [requests, user?.id, isUMKM]);

  const filteredHistory = useMemo(() => 
    historyData.filter(req => 
      req.fabricName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  , [historyData, searchTerm]);

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

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <HistoryIcon className="text-slate-900" size={24} />
            Riwayat Pesanan
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-9">Log semua permintaan pengadaan dan status pemenuhan</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari pesanan..."
            className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-4 focus:ring-indigo-50 outline-none w-full md:w-80 transition-all font-bold text-xs"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <ViewportAware placeholderHeight="500px" className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left table-fixed">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase border-b">
                <th className="px-8 py-5 w-[15%]">Tanggal</th>
                <th className="px-8 py-5 w-[25%]">{isUMKM ? 'Supplier' : 'UMKM'}</th>
                <th className="px-8 py-5 w-[25%]">Bahan</th>
                <th className="px-8 py-5 w-[10%] text-center">Jumlah</th>
                <th className="px-8 py-5 w-[15%]">Status</th>
                <th className="px-8 py-5 w-[10%] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-24 text-center text-slate-400 font-bold uppercase text-xs opacity-30">Tidak ada catatan yang cocok</td></tr>
              ) : (
                paginatedHistory.map((req) => (
                  <HistoryRow 
                    key={req.id} 
                    req={req} 
                    isUMKM={isUMKM} 
                    onUpload={setUploadingRequestId} 
                    onComplete={(id) => updateRequestStatus(id, RequestStatus.COMPLETED)} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase">Halaman {currentPage} dari {totalPages || 1}</span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl border bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </ViewportAware>

      {uploadingRequestId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <span className="text-xs font-medium uppercase tracking-widest">Unggah Bukti Pembayaran</span>
                <button onClick={() => { setUploadingRequestId(null); setTempProof(null); }} className="hover:bg-white/20 p-1.5 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all h-48 ${tempProof ? 'border-emerald-200 bg-green-50/30' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {tempProof ? <img src={tempProof} className="h-full w-full object-contain rounded-xl" alt="Preview" /> : (
                        <>
                            <ImageIcon size={32} className="text-slate-300 mb-2" />
                            <span className="text-xs font-medium text-slate-400 uppercase">Klik untuk Pilih Struk</span>
                        </>
                    )}
                </div>
                <div className="flex gap-2 text-[10px] text-slate-400 italic font-medium"><AlertCircle size={14} className="shrink-0" /> Unggah struk transfer untuk memulai verifikasi.</div>
                <button 
                    onClick={handleUploadSubmit}
                    disabled={!tempProof}
                    className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 transition-all active:scale-95 shadow-xl shadow-indigo-100"
                >
                    Kirim Bukti
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
