
import React, { Suspense, lazy, useMemo, memo } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, RequestStatus } from '../types';
import { 
  Package, 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  RefreshCw,
  Clock as ClockIcon,
  History as HistoryIcon,
  LayoutDashboard
} from 'lucide-react';
import { ViewportAware } from '../components/ViewportAware';

// Dynamically import the chart to isolate Recharts dependency
const InventoryChart = lazy(() => import('../components/charts/InventoryChart'));

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: string; 
  trendUp?: boolean;
  color: string;
}> = memo(({ title, value, icon, trend, trendUp, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-black flex items-center px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend} {trendUp ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />}
        </span>
      )}
    </div>
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
  </div>
));

export const Dashboard: React.FC = () => {
  const { user, fabrics, requests, hijabProducts, isLoading } = useApp();

  const isUMKM = user?.role === UserRole.UMKM;

  const chartData = useMemo(() => 
    hijabProducts.map(p => ({
      name: p.name,
      stock: p.stock,
      threshold: p.threshold
    })), [hijabProducts]);

  if (isLoading) return null;

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
          <LayoutDashboard className="text-indigo-600" size={24} />
          {isUMKM ? 'Executive Dashboard' : 'Supplier Console'}
        </h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 ml-9">
          {isUMKM ? 'Global overview of your supply chain performance' : 'Monitor warehouse levels and UMKM partnerships'}
        </p>
      </div>
    </div>
  );

  if (isUMKM) {
    const totalHijabStock = hijabProducts.reduce((sum, p) => sum + p.stock, 0);
    const activeSuppliers = new Set(fabrics.map(f => f.supplierId)).size;
    const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const lowStockAlerts = hijabProducts.filter(p => p.stock < p.threshold).length;

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {renderHeader()}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Hijab Stock" value={totalHijabStock} icon={<Package size={20} />} trend="+12%" trendUp color="bg-indigo-600" />
          <StatCard title="Active Suppliers" value={activeSuppliers} icon={<Users size={20} />} color="bg-blue-600" />
          <StatCard title="Active Requests" value={pendingRequests} icon={<Clock size={20} />} trend="-2" trendUp={false} color="bg-amber-600" />
          <StatCard title="Low Stock Items" value={lowStockAlerts} icon={<AlertTriangle size={20} />} color="bg-rose-600" />
        </div>

        <ViewportAware placeholderHeight="450px" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center opacity-20"><RefreshCw className="animate-spin" /></div>}>
            <InventoryChart data={chartData} />
          </Suspense>
        </ViewportAware>

        <ViewportAware placeholderHeight="300px" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center">
              <ClockIcon size={18} className="mr-3 text-amber-600" /> Partner Fabric Catalog Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fabrics.slice(0, 9).map(f => (
                <div key={f.id} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">{f.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{f.supplierName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-indigo-600">{f.stock}m</p>
                    <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${f.stock > 20 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {f.stock > 20 ? 'In Stock' : 'Limited'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
        </ViewportAware>
      </div>
    );
  } else {
    // Supplier Dashboard View
    const myFabrics = fabrics.filter(f => f.supplierId === user?.id);
    const totalStock = myFabrics.reduce((sum, f) => sum + f.stock, 0);
    const myRequests = requests.filter(r => r.supplierId === user?.id);
    const incomingRequests = myRequests.filter(r => r.status === RequestStatus.PENDING).length;

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {renderHeader()}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Material Types" value={myFabrics.length} icon={<Package size={20} />} color="bg-indigo-600" />
          <StatCard title="Total Ready Stock" value={`${totalStock}m`} icon={<TrendingUp size={20} />} trend="+450m" trendUp color="bg-emerald-600" />
          <StatCard title="New Orders" value={incomingRequests} icon={<ShoppingCart size={20} />} trend="+2" trendUp color="bg-amber-600" />
          <StatCard title="Order History" value={myRequests.length} icon={<HistoryIcon size={20} />} color="bg-slate-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ViewportAware placeholderHeight="400px" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Incoming Fabric Requests</h4>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase">Action Required</span>
              </div>
            </div>
            {myRequests.filter(r => r.status === RequestStatus.PENDING).length === 0 ? (
              <div className="text-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <ClockIcon size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.filter(r => r.status === RequestStatus.PENDING).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-6 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all hover:border-indigo-100">
                    <div>
                      <p className="text-xs font-black text-slate-800">{r.umkmName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requesting {r.quantity}m of {r.fabricName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100">Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ViewportAware>

          <ViewportAware placeholderHeight="400px" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Warehouse Inventory Status</h4>
            <div className="space-y-6">
              {myFabrics.map(f => (
                <div key={f.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-black text-slate-800">{f.name}</span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.color}</p>
                    </div>
                    <span className="text-sm font-black text-indigo-600">{f.stock}m</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${f.stock < 50 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, (f.stock / 200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </ViewportAware>
        </div>
      </div>
    );
  }
};
