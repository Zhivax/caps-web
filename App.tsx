
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';
import { Login } from './pages/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FabricCatalog } from './pages/umkm/FabricCatalog';
import { SupplierDirectory } from './pages/umkm/SupplierDirectory';
import { HijabInventory } from './pages/umkm/HijabInventory';
import { RawMaterials } from './pages/umkm/RawMaterials';
import { UsageHistory } from './pages/umkm/UsageHistory';
import { Sales } from './pages/umkm/Sales';
import { InventoryList as SupplierInventory } from './pages/supplier/InventoryList';
import { AddFabric as SupplierAddFabric } from './pages/supplier/AddFabric';
import { Requests as SupplierRequests } from './pages/supplier/Requests';
import { History } from './pages/History';

const Main: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.id]);

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      // UMKM Sub-menus
      case 'catalog': return <FabricCatalog />;
      case 'directory': return <SupplierDirectory />;
      
      // Production & Stock sub-menus
      case 'hijab-inv': return <HijabInventory />;
      case 'raw-materials': return <RawMaterials />;
      case 'usage-history': return <UsageHistory />;
      
      // Sales consolidated menu
      case 'sales': return <Sales />;
      
      // Supplier Sub-menus
      case 'inventory': return <SupplierInventory />;
      case 'add-fabric': return <SupplierAddFabric />;
      
      case 'requests': return <SupplierRequests />;
      case 'history': return <History />;
      case 'settings': return (
        <div className="p-12 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl shadow-sm">
          <p className="font-medium text-slate-600">User Profile & Preferences</p>
          <p className="text-sm">Account settings management coming soon.</p>
        </div>
      );
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;
