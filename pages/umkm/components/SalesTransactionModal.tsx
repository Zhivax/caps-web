
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Tag, AlertCircle, ShoppingCart, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SalesTransactionModal: React.FC<Props> = ({ onClose }) => {
  const { hijabProducts, recordSale } = useApp();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = hijabProducts.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await recordSale({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        trackingNumber,
        date
      });
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="px-10 py-8 bg-indigo-600 text-white flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest">Record Sale</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm"
              required
            >
              <option value="">-- Choose Product --</option>
              {hijabProducts.map(p => <option key={p.id} value={p.id}>{p.name} - Stock: {p.stock}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" placeholder="Qty" required />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" required />
            </div>
            <input type="text" placeholder="Invoice Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" required />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedProductId || (selectedProduct && selectedProduct.stock < quantity)}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 disabled:opacity-40"
          >
            {isSubmitting ? 'Processing...' : 'Verify Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalesTransactionModal;
