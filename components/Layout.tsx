
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  ChevronDown,
  Layers,
  BadgeDollarSign
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isSubItem?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  active, 
  onClick, 
  isSubItem = false,
  hasChildren = false,
  isExpanded = false
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
      isSubItem ? 'pl-9 py-1.5' : ''
    } ${
      active && !hasChildren
        ? 'bg-slate-900 text-white' 
        : active && hasChildren 
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center space-x-3">
      {!isSubItem && <span className="shrink-0">{icon}</span>}
      {isSubItem && <div className={`w-1 h-1 rounded-full ${active ? 'bg-slate-900' : 'bg-slate-400'}`}></div>}
      <span className="text-left">
        {label}
      </span>
    </div>
    {hasChildren && (
      <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
        <ChevronDown size={14} />
      </span>
    )}
  </button>
);

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: { id: string; label: string }[];
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, notifications, markNotificationsAsRead } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const myNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = myNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems: MenuItem[] = user?.role === UserRole.UMKM 
    ? [
        { id: 'dashboard', label: 'Dasbor', icon: <LayoutDashboard size={20} /> },
        { 
          id: 'fabric-supplier', 
          label: 'Supplier Kain', 
          icon: <Users size={20} />,
          children: [
            { id: 'catalog', label: 'Katalog Kain' },
            { id: 'directory', label: 'Direktori Supplier' }
          ]
        },
        { 
          id: 'production-stock', 
          label: 'Produksi & Stok', 
          icon: <Layers size={20} />,
          children: [
            { id: 'hijab-inv', label: 'Inventori Hijab' },
            { id: 'raw-materials', label: 'Bahan Baku' },
            { id: 'usage-history', label: 'Riwayat Penggunaan' }
          ]
        },
        { id: 'sales', label: 'Manajemen Penjualan', icon: <BadgeDollarSign size={20} /> },
        { id: 'history', label: 'Riwayat Pesanan', icon: <History size={20} /> },
        { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
      ]
    : [
        { id: 'dashboard', label: 'Dasbor Supplier', icon: <LayoutDashboard size={20} /> },
        { 
          id: 'fabric-mgmt', 
          label: 'Manajemen Kain', 
          icon: <Package size={20} />,
          children: [
            { id: 'inventory', label: 'Inventori Saya' },
            { id: 'add-fabric', label: 'Tambah Kain Baru' }
          ]
        },
        { id: 'requests', label: 'Pesanan Masuk', icon: <ShoppingCart size={20} /> },
        { id: 'history', label: 'Riwayat', icon: <History size={20} /> },
        { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
      ];

  useEffect(() => {
    menuItems.forEach(item => {
      if (item.children?.some(child => child.id === activeTab)) {
        if (!expandedMenus.includes(item.id)) {
          setExpandedMenus(prev => [...prev, item.id]);
        }
      }
    });
  }, [activeTab]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={16} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={16} />;
      case 'error': return <X className="text-rose-500" size={16} />;
      default: return <Info className="text-indigo-500" size={16} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-soft shrink-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-slate-900">SupplyChain</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-600 hover:text-slate-900 relative">
             <Bell size={20} />
             {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 hover:text-slate-900">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-large' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-full
      `}>
        <div className="h-full flex flex-col p-5">
          <div className="hidden md:flex items-center space-x-2 mb-8 px-2 shrink-0">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">SupplyChain</span>
              <span className="text-[10px] text-slate-500">B2B Platform</span>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
            {menuItems.map((item) => {
              const hasChildren = !!item.children;
              const isExpanded = expandedMenus.includes(item.id);
              const isActive = (activeTab === item.id) || (item.children?.some(child => child.id === activeTab));

              return (
                <div key={item.id} className="space-y-0.5">
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    active={isActive}
                    hasChildren={hasChildren}
                    isExpanded={isExpanded}
                    onClick={() => {
                      if (hasChildren) {
                        toggleMenu(item.id);
                      } else {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }
                    }}
                  />
                  {hasChildren && isExpanded && (
                    <div className="space-y-0.5">
                      {item.children?.map(child => (
                        <SidebarItem
                          key={child.id}
                          icon={null}
                          label={child.label}
                          active={activeTab === child.id}
                          isSubItem={true}
                          onClick={() => {
                            setActiveTab(child.id);
                            setIsSidebarOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="pt-5 mt-5 border-t border-slate-200 shrink-0">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium text-sm"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0">
        <header className="hidden md:flex items-center justify-end px-8 py-4 bg-white border-b border-slate-200 shrink-0 z-50">
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) markNotificationsAsRead();
                }}
                className={`p-2 rounded-lg ${isNotifOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-large overflow-hidden z-[100]">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">Notifikasi</h4>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {myNotifications.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Tidak ada notifikasi</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {myNotifications.map(n => (
                          <div key={n.id} className={`p-4 flex gap-3 ${n.read ? 'bg-white' : 'bg-slate-50'}`}>
                            <div className="mt-0.5">{getNotifIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 mb-0.5">{n.title}</p>
                              <p className="text-xs text-slate-600 leading-relaxed mb-1">{n.message}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <img src={user?.avatar} alt="Profile" className="w-9 h-9 rounded-lg ring-2 ring-slate-100 object-cover" />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-50 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
