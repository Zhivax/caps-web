
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <UsersIcon className="text-slate-900" size={24} />
            Supplier Directory
          </h3>
          <p className="text-sm text-slate-500 mt-1">Connect with textile experts and manufacturers</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search supplier name..." 
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none w-full focus:ring-2 focus:ring-slate-900 focus:border-slate-900" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <div className="relative w-full">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg outline-none text-sm text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 appearance-none w-full"
            >
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Search size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No suppliers found</p>
          </div>
        ) : (
          filteredSuppliers.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-medium transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <img src={s.avatar} alt={s.name} className="w-16 h-16 rounded-lg object-cover ring-2 ring-slate-100" />
                <div className="text-right">
                  <p className="text-xs text-slate-500">{fabrics.filter(f => f.supplierId === s.id).length} Materials</p>
                </div>
              </div>
              <h4 className="font-semibold text-slate-900 text-lg mb-1">{s.name}</h4>
              <div className="flex items-center text-slate-500 text-xs mb-4">
                <MapPin size={14} className="mr-1" /> {s.location}
              </div>
              <p className="text-sm text-slate-600 mb-6 line-clamp-2 leading-relaxed">
                {s.description}
              </p>
              
              {/* Footer Buttons */}
              <div className="mt-auto pt-5 border-t border-slate-200 flex items-center justify-end gap-3">
                <a 
                  href={`https://wa.me/${s.phone?.replace(/^0/, '62')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center"
                  title="Contact via WhatsApp"
                >
                  <MessageCircle size={18} />
                </a>
                <button 
                  onClick={() => setSelectedSupplier(s)}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Supplier Detail Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-large w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-32 bg-slate-900 shrink-0">
              <button 
                onClick={() => setSelectedSupplier(null)} 
                className="absolute top-4 right-4 p-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-xl shadow-medium">
                <img src={selectedSupplier.avatar} alt={selectedSupplier.name} className="w-20 h-20 rounded-lg object-cover" />
              </div>
            </div>

            <div className="pt-14 px-8 pb-8 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">{selectedSupplier.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <span className="flex items-center text-xs text-slate-500">
                      <MapPin size={14} className="mr-1" /> {selectedSupplier.location}
                    </span>
                    <span className="flex items-center text-xs text-slate-500">
                      <Phone size={14} className="mr-1" /> {selectedSupplier.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Info size={16} /> About Supplier
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedSupplier.description}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package size={16} /> Available Collections ({supplierFabrics.length})
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {supplierFabrics.map(f => (
                      <div key={f.id} className="p-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                          <p className="text-xs text-slate-500">{f.type} • {f.color}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs font-semibold text-slate-900">Rp {f.pricePerUnit.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{f.stock}m left</p>
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
