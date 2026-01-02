
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
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-soft hover:shadow-medium transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-lg ${color} text-white`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium flex items-center px-2 py-1 rounded-md ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend} {trendUp ? <ArrowUpRight size={12} className="ml-0.5" /> : <ArrowDownRight size={12} className="ml-0.5" />}
        </span>
      )}
    </div>
    <p className="text-xs text-slate-500 font-medium mb-1">{title}</p>
    <h3 className="text-2xl font-semibold text-slate-900">{value}</h3>
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
          <LayoutDashboard className="text-slate-900" size={24} />
          {isUMKM ? 'Dasbor' : 'Dasbor Supplier'}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {isUMKM ? 'Gambaran umum kinerja rantai pasokan Anda' : 'Monitor level gudang dan kemitraan'}
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
      <div className="space-y-6">
        {renderHeader()}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Stok Hijab" value={totalHijabStock} icon={<Package size={18} />} trend="+12%" trendUp color="bg-slate-900" />
          <StatCard title="Supplier Aktif" value={activeSuppliers} icon={<Users size={18} />} color="bg-blue-600" />
          <StatCard title="Permintaan Aktif" value={pendingRequests} icon={<Clock size={18} />} trend="-2" trendUp={false} color="bg-amber-500" />
          <StatCard title="Item Stok Rendah" value={lowStockAlerts} icon={<AlertTriangle size={18} />} color="bg-red-600" />
        </div>

        <ViewportAware placeholderHeight="400px" className="bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center opacity-20"><RefreshCw className="animate-spin" /></div>}>
            <InventoryChart data={chartData} />
          </Suspense>
        </ViewportAware>

        <ViewportAware placeholderHeight="300px" className="bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
           <h4 className="text-sm font-semibold text-slate-900 mb-6 flex items-center">
              <ClockIcon size={18} className="mr-2 text-amber-500" /> Status Katalog Kain
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fabrics.slice(0, 9).map(f => (
                <div key={f.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{f.name}</p>
                    <p className="text-xs text-slate-500 truncate">{f.supplierName}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-slate-900">{f.stock}m</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${f.stock > 20 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.stock > 20 ? 'Tersedia' : 'Terbatas'}
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
      <div className="space-y-6">
        {renderHeader()}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Jenis Bahan" value={myFabrics.length} icon={<Package size={18} />} color="bg-slate-900" />
          <StatCard title="Total Stok Siap" value={`${totalStock}m`} icon={<TrendingUp size={18} />} trend="+450m" trendUp color="bg-green-600" />
          <StatCard title="Pesanan Baru" value={incomingRequests} icon={<ShoppingCart size={18} />} trend="+2" trendUp color="bg-amber-500" />
          <StatCard title="Riwayat Pesanan" value={myRequests.length} icon={<HistoryIcon size={18} />} color="bg-slate-700" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ViewportAware placeholderHeight="400px" className="bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-semibold text-slate-900">Permintaan Kain Masuk</h4>
              {myRequests.filter(r => r.status === RequestStatus.PENDING).length > 0 && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md">Perlu Tindakan</span>
              )}
            </div>
            {myRequests.filter(r => r.status === RequestStatus.PENDING).length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <ClockIcon size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">Tidak ada permintaan tertunda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.filter(r => r.status === RequestStatus.PENDING).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{r.umkmName}</p>
                      <p className="text-xs text-slate-500">Meminta {r.quantity}m {r.fabricName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors">Detail</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ViewportAware>

          <ViewportAware placeholderHeight="400px" className="bg-white p-6 rounded-xl border border-slate-200 shadow-soft">
            <h4 className="text-sm font-semibold text-slate-900 mb-6">Status Inventori Gudang</h4>
            <div className="space-y-5">
              {myFabrics.map(f => (
                <div key={f.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-medium text-slate-900">{f.name}</span>
                      <p className="text-xs text-slate-500">{f.color}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{f.stock}m</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${f.stock < 50 ? 'bg-red-500' : 'bg-slate-900'}`}
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
