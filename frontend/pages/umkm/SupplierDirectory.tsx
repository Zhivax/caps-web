
import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';
import { USERS } from '../../data/mockData';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  X,
  Phone,
  Info,
  Package,
  Filter,
  MessageCircle,
  Users as UsersIcon
} from 'lucide-react';

export const SupplierDirectory: React.FC = () => {
  const { fabrics } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Cities');
  const [selectedSupplier, setSelectedSupplier] = useState<User | null>(null);
  
  const allSuppliers = USERS.filter(u => u.role === UserRole.SUPPLIER);

  // Extract unique locations for the filter
  const availableLocations = useMemo(() => {
    const locations = allSuppliers.map(s => s.location || 'Unknown').filter(loc => loc !== 'Unknown');
    return ['All Cities', ...new Set(locations)];
  }, [allSuppliers]);

  // Combined search (Strict name only) and filter logic
  const filteredSuppliers = allSuppliers.filter(s => {
    const matchesName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'All Cities' || s.location === locationFilter;
    return matchesName && matchesLocation;
  });

  const supplierFabrics = selectedSupplier 
    ? fabrics.filter(f => f.supplierId === selectedSupplier.id)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <UsersIcon className="text-indigo-600" size={24} />
            Supplier Directory
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">Connect with textile experts and manufacturers</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search supplier name..." 
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none w-full focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="relative w-full">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-xs text-slate-600 focus:ring-4 focus:ring-indigo-50 appearance-none w-full"
            >
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Search size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No suppliers found</p>
          </div>
        ) : (
          filteredSuppliers.map(s => (
            <div key={s.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-xl transition-all flex flex-col group">
              <div className="flex items-start justify-between mb-6">
                <img src={s.avatar} alt={s.name} className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-50 shadow-md group-hover:scale-105 transition-transform" />
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{fabrics.filter(f => f.supplierId === s.id).length} Materials Available</p>
                </div>
              </div>
              <h4 className="font-black text-slate-800 text-xl mb-1 group-hover:text-indigo-600 transition-colors">{s.name}</h4>
              <div className="flex items-center text-slate-400 text-[11px] font-bold mb-5">
                <MapPin size={14} className="mr-1.5 text-rose-400" /> {s.location}
              </div>
              <p className="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed font-medium">
                {s.description}
              </p>
              
              {/* Footer Buttons */}
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-end gap-3">
                <a 
                  href={`https://wa.me/${s.phone?.replace(/^0/, '62')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all group/wa flex items-center justify-center shadow-sm"
                  title="Contact via WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
                <button 
                  onClick={() => setSelectedSupplier(s)}
                  className="flex-1 p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group/btn flex items-center justify-center gap-2"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-32 bg-indigo-600 shrink-0">
              <button 
                onClick={() => setSelectedSupplier(null)} 
                className="absolute top-6 right-6 p-2 bg-white/20 text-white hover:bg-white/40 rounded-full transition-all z-10"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-12 left-10 p-2 bg-white rounded-[2rem] shadow-xl">
                <img src={selectedSupplier.avatar} alt={selectedSupplier.name} className="w-24 h-24 rounded-[1.5rem] object-cover" />
              </div>
            </div>

            <div className="pt-16 px-10 pb-10 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedSupplier.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                    <span className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin size={12} className="mr-1 text-rose-500" /> {selectedSupplier.location}
                    </span>
                    <span className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Phone size={12} className="mr-1 text-indigo-500" /> {selectedSupplier.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={14} /> About Supplier
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedSupplier.description}
                  </p>
                </div>

                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Package size={14} /> Available Collections ({supplierFabrics.length})
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {supplierFabrics.map(f => (
                      <div key={f.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group/item hover:border-indigo-200 transition-all">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 truncate">{f.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.type} • {f.color}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-black text-indigo-600">Rp {f.pricePerUnit.toLocaleString()}</p>
                          <p className="text-[8px] font-bold text-slate-300 uppercase">{f.stock}m left</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
