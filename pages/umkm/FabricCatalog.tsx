
import React, { useState, useMemo, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { Fabric } from '../../types';
import { 
  Search, 
  Package, 
  ShoppingCart, 
  Building2, 
  X,
  ShoppingCart as CatalogIcon
} from 'lucide-react';
import { ViewportAware } from '../../components/ViewportAware';

const FabricCard = memo(({ f, onOrder }: { f: Fabric, onOrder: (f: Fabric) => void }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col group hover:shadow-medium transition-shadow h-full">
    <div className="mb-4">
      <div className="text-xs text-slate-500 flex items-center mb-1">
        <Building2 size={12} className="mr-1" />{f.supplierName}
      </div>
      <p className="text-slate-900 font-semibold text-base leading-tight">{f.name}</p>
      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{f.type}</span>
    </div>
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: f.color.replace(/\s/g, '').toLowerCase() }}></div>
        <span className="text-sm text-slate-600">{f.color}</span>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${f.stock < 50 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {f.stock}m Tersedia
      </span>
    </div>
    <div className="mt-auto pt-5 border-t border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 mb-0.5">Harga / m</p>
        <p className="font-semibold text-slate-900 text-lg">Rp {f.pricePerUnit.toLocaleString()}</p>
      </div>
      <button onClick={() => onOrder(f)} className="p-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
        <ShoppingCart size={18} />
      </button>
    </div>
  </div>
));

export const FabricCatalog: React.FC = () => {
  const { fabrics, user, submitRequest } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua Jenis');
  const [filterColor, setFilterColor] = useState('Semua Warna');
  const [filterSupplier, setFilterSupplier] = useState('Semua Supplier');
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [requestQty, setRequestQty] = useState(1);
  const [requestNotes, setRequestNotes] = useState('');

  const filteredFabrics = useMemo(() => fabrics.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Semua Jenis' || f.type === filterType;
    const matchesColor = filterColor === 'Semua Warna' || f.color === filterColor;
    const matchesSupplier = filterSupplier === 'Semua Supplier' || f.supplierName === filterSupplier;
    return matchesSearch && matchesType && matchesColor && matchesSupplier;
  }), [fabrics, searchTerm, filterType, filterColor, filterSupplier]);

  const availableTypes = useMemo(() => ['Semua Jenis', ...new Set(fabrics.map(f => f.type))], [fabrics]);
  const availableColors = useMemo(() => ['Semua Warna', ...new Set(fabrics.map(f => f.color))], [fabrics]);
  const availableSuppliers = useMemo(() => ['Semua Supplier', ...new Set(fabrics.map(f => f.supplierName))], [fabrics]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFabric || !user) return;
    if (requestQty > selectedFabric.stock) {
      alert('Jumlah permintaan melebihi stok yang tersedia!');
      return;
    }
    submitRequest({
      umkmId: user.id,
      supplierId: selectedFabric.supplierId,
      supplierName: selectedFabric.supplierName,
      fabricId: selectedFabric.id,
      fabricName: selectedFabric.name,
      fabricColor: selectedFabric.color,
      quantity: requestQty,
      notes: requestNotes
    });
    setSelectedFabric(null);
    setRequestQty(1);
    setRequestNotes('');
    alert('Permintaan bahan berhasil dikirim ke mitra.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <CatalogIcon className="text-slate-900" size={24} />
            Katalog Kain
          </h3>
          <p className="text-sm text-slate-500 mt-1">Jelajahi dan pesan bahan dari mitra terverifikasi</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex flex-col xl:flex-row xl:items-center gap-4">
         <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama kain..." 
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none w-full focus:ring-2 focus:ring-slate-900 focus:border-slate-900" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select 
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
          >
            {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="px-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            {availableSuppliers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

       {filteredFabrics.length === 0 ? (
         <div className="bg-white rounded-xl border border-dashed border-slate-300 p-20 text-center">
             <Package size={40} className="mx-auto mb-3 text-slate-300" />
             <p className="text-sm text-slate-500">Tidak ada kain yang cocok dengan pencarian/filter Anda</p>
         </div>
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFabrics.map(f => (
            <ViewportAware key={f.id} placeholderHeight="280px">
              <FabricCard f={f} onOrder={setSelectedFabric} />
            </ViewportAware>
          ))}
        </div>
      )}

      {selectedFabric && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-black text-[10px] uppercase tracking-widest">Pesan Bahan</h4>
              <button onClick={() => setSelectedFabric(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-slate-900 shrink-0"><Package size={20} /></div>
                  <div className="min-w-0">
                      <h5 className="font-black text-slate-800 text-xs truncate">{selectedFabric.name}</h5>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{selectedFabric.supplierName}</p>
                  </div>
              </div>

              <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest ml-1">Jumlah (meter)</label>
                  <input 
                      type="number" 
                      min="1" 
                      max={selectedFabric.stock}
                      value={requestQty}
                      onChange={(e) => setRequestQty(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-500 font-bold text-slate-800 text-sm"
                      required
                  />
              </div>

              <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 flex justify-between items-end">
                  <p className="text-xs font-medium text-slate-400 uppercase">Total Keseluruhan</p>
                  <p className="text-xl font-black text-slate-900">Rp {(selectedFabric.pricePerUnit * requestQty).toLocaleString()}</p>
              </div>

              <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                  Kirim Pesanan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
