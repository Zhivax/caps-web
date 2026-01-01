
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RequestStatus } from '../../types';
import { Check, X, Clock, User, Package, Truck, Ban, AlertCircle, ImageIcon, ShieldCheck, ExternalLink, ShoppingCart as OrderIcon } from 'lucide-react';

export const Requests: React.FC = () => {
  const { requests, user, updateRequestStatus, fabrics } = useApp();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  
  const activeRequests = requests.filter(r => 
    r.supplierId === user?.id && 
    [RequestStatus.PENDING, RequestStatus.WAITING_VERIFICATION, RequestStatus.APPROVED, RequestStatus.SHIPPED].includes(r.status)
  );

  const handleApprove = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, RequestStatus.APPROVED);
      alert('Payment approved and stock updated.');
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <OrderIcon className="text-slate-900" size={24} />
            Incoming Orders
          </h3>
          <p className="text-sm text-slate-500 mt-1 ml-9">Process and verify incoming UMKM requests</p>
        </div>
        <span className="px-5 py-2.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium uppercase tracking-widest shadow-sm">
          {activeRequests.length} ACTIVE BATCHES
        </span>
      </div>

      {activeRequests.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-20 text-center">
          <Clock size={48} className="mx-auto text-slate-200 mb-4" />
          <h4 className="text-lg font-bold text-slate-400">All clear!</h4>
          <p className="text-slate-400 text-sm">No new requests for now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeRequests.map((req) => {
            const fabric = fabrics.find(f => f.id === req.fabricId);
            
            // Status states
            const isVerificationNeeded = req.status === RequestStatus.PENDING || req.status === RequestStatus.WAITING_VERIFICATION;
            const isApproved = req.status === RequestStatus.APPROVED;
            const isShipped = req.status === RequestStatus.SHIPPED;
            
            const canApprove = fabric && fabric.stock >= req.quantity;

            return (
              <div key={req.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-100 transition-all group animate-in fade-in">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                       <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg leading-none mb-1">{req.umkmName}</h4>
                      <p className="text-sm text-slate-500 flex items-center">
                        <Clock size={12} className="mr-1.5" /> Ordered {new Date(req.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-slate-50/50 rounded-lg border border-slate-100/50">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 text-slate-900 rounded-xl"><Package size={20} /></div>
                      <div>
                        <p className="text-xs font-medium text-slate-400 uppercase">Material</p>
                        <p className="text-sm font-bold text-slate-800">{req.fabricName} ({req.fabricColor})</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase">Quantity</p>
                      <p className="text-sm font-bold text-slate-800">{req.quantity}m</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase">Payment Status</p>
                      <span className={`text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                        isVerificationNeeded ? 'bg-amber-100 text-amber-700' : 
                        isApproved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isVerificationNeeded ? 'Unverified' : isApproved ? 'Paid & Confirmed' : 'Shipped'}
                      </span>
                    </div>
                  </div>

                  {!canApprove && isVerificationNeeded && (
                    <div className="p-3 bg-red-50 border border-rose-100 text-red-600 text-xs font-medium uppercase rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} /> Stock Warning: Warehouse only has {fabric?.stock || 0}m available.
                    </div>
                  )}

                  {req.notes && (
                    <div className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border-l-4 border-slate-200">Note: "{req.notes}"</div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-[220px]">
                  {isVerificationNeeded && (
                    <div className="space-y-3">
                        {req.paymentProof ? (
                            <button 
                                onClick={() => setSelectedProof(req.paymentProof!)}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-medium uppercase hover:bg-indigo-50 transition-all"
                            >
                                <ImageIcon size={16} /> View Payment Proof
                            </button>
                        ) : (
                            <div className="p-3 bg-red-50 border border-rose-100 text-red-600 text-xs font-medium uppercase rounded-xl flex items-center gap-2">
                                <AlertCircle size={14} /> Payment Proof Missing
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2">
                            <button 
                                onClick={() => handleApprove(req.id)}
                                disabled={!req.paymentProof || !canApprove}
                                className="flex items-center justify-center space-x-2 py-4 bg-green-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-emerald-50 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Check size={18} /> Approve Payment
                            </button>
                            <button 
                                onClick={() => updateRequestStatus(req.id, RequestStatus.REJECTED)}
                                className="flex items-center justify-center space-x-2 py-3 bg-white border border-rose-200 text-red-500 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                            >
                                <X size={16} /> Reject Payment
                            </button>
                        </div>
                    </div>
                  )}

                  {isApproved && (
                    <button 
                      onClick={() => updateRequestStatus(req.id, RequestStatus.SHIPPED)}
                      className="flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                      <Truck size={18} /> Ship Materials
                    </button>
                  )}

                  {isShipped && (
                    <div className="bg-green-50 p-4 rounded-lg border border-emerald-100 text-center">
                        <p className="text-xs font-medium text-green-600 uppercase tracking-widest">In Transit</p>
                        <p className="text-[9px] font-bold text-green-400 mt-1 uppercase">UMKM will confirm receipt</p>
                    </div>
                  )}

                  {isApproved && (
                    <button 
                        onClick={() => updateRequestStatus(req.id, RequestStatus.CANCELLED)}
                        className="text-xs font-medium text-slate-300 uppercase hover:text-red-500 transition-colors"
                    >
                        Void Transaction
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative max-w-2xl w-full bg-white rounded-xl p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4 px-4 pt-2">
                    <h5 className="text-sm text-slate-500 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" /> Payment Confirmation Detail
                    </h5>
                    <button onClick={() => setSelectedProof(null)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden rounded-lg border border-slate-100">
                    <img src={selectedProof} className="w-full h-auto max-h-[70vh] object-contain" alt="Payment Proof Large" />
                </div>
                <div className="mt-6 flex justify-center pb-2">
                    <button onClick={() => setSelectedProof(null)} className="px-8 py-3.5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">
                        Back to Requests
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
