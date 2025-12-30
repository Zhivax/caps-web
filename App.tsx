
import React, { useState, useEffect, Suspense, lazy, useTransition } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';

// Lazy loading rute utama
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const FabricCatalog = lazy(() => import('./pages/umkm/FabricCatalog').then(m => ({ default: m.FabricCatalog })));
const SupplierDirectory = lazy(() => import('./pages/umkm/SupplierDirectory').then(m => ({ default: m.SupplierDirectory })));
const HijabInventory = lazy(() => import('./pages/umkm/HijabInventory').then(m => ({ default: m.HijabInventory })));
const RawMaterials = lazy(() => import('./pages/umkm/RawMaterials').then(m => ({ default: m.RawMaterials })));
const UsageHistory = lazy(() => import('./pages/umkm/UsageHistory').then(m => ({ default: m.UsageHistory })));
const Sales = lazy(() => import('./pages/umkm/Sales').then(m => ({ default: m.Sales })));
const SupplierInventory = lazy(() => import('./pages/supplier/InventoryList').then(m => ({ default: m.InventoryList })));
const SupplierAddFabric = lazy(() => import('./pages/supplier/AddFabric').then(m => ({ default: m.AddFabric })));
const SupplierRequests = lazy(() => import('./pages/supplier/Requests').then(m => ({ default: m.Requests })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));

const Main: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.id]);

  if (!user) return <Login />;

  const handleTabChange = (tab: string) => {
    // Membungkus perubahan state dalam transition agar halaman lama tidak langsung hilang
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'catalog': return <FabricCatalog />;
      case 'directory': return <SupplierDirectory />;
      case 'hijab-inv': return <HijabInventory />;
      case 'raw-materials': return <RawMaterials />;
      case 'usage-history': return <UsageHistory />;
      case 'sales': return <Sales />;
      case 'inventory': return <SupplierInventory />;
      case 'add-fabric': return <SupplierAddFabric />;
      case 'requests': return <SupplierRequests />;
      case 'history': return <History />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      <div className={isPending ? "opacity-80 transition-opacity duration-300" : ""}>
        <Suspense fallback={null}>
          {renderContent()}
        </Suspense>
      </div>
    </Layout>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <Main />
  </AppProvider>
);

export default App;
