
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
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
      isSubItem ? 'pl-10 py-2.5' : ''
    } ${
      active && !hasChildren
        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-100 ring-1 ring-indigo-200/70' 
        : active && hasChildren 
          ? 'bg-slate-100/80 text-indigo-600'
          : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-800'
    }`}
  >
    <div className="flex items-center space-x-3">
      {!isSubItem && <span className="shrink-0">{icon}</span>}
      {isSubItem && <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>}
      <span className={`font-black uppercase tracking-widest text-left ${isSubItem ? 'text-[9px]' : 'text-xs'}`}>
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
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { 
          id: 'fabric-supplier', 
          label: 'Fabric Supplier', 
          icon: <Users size={20} />,
          children: [
            { id: 'catalog', label: 'Fabric Catalog' },
            { id: 'directory', label: 'Supplier Directory' }
          ]
        },
        { 
          id: 'production-stock', 
          label: 'Production & Stock', 
          icon: <Layers size={20} />,
          children: [
            { id: 'hijab-inv', label: 'Hijab Inventory' },
            { id: 'raw-materials', label: 'Raw Materials' },
            { id: 'usage-history', label: 'Usage History' }
          ]
        },
        { id: 'sales', label: 'Sales Management', icon: <BadgeDollarSign size={20} /> },
        { id: 'history', label: 'Order History', icon: <History size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
      ]
    : [
        { id: 'dashboard', label: 'Supplier Dashboard', icon: <LayoutDashboard size={20} /> },
        { 
          id: 'fabric-mgmt', 
          label: 'Fabric Management', 
          icon: <Package size={20} />,
          children: [
            { id: 'inventory', label: 'My Inventory' },
            { id: 'add-fabric', label: 'Add New Fabric' }
          ]
        },
        { id: 'requests', label: 'Incoming Orders', icon: <ShoppingCart size={20} /> },
        { id: 'history', label: 'History', icon: <History size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
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
    <div className="relative min-h-screen flex flex-col md:flex-row bg-transparent font-sans overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/60" aria-hidden />
      <div className="absolute -left-24 -top-24 w-80 h-80 bg-indigo-200/20 blur-3xl rounded-full" aria-hidden />
      <div className="absolute right-[-10%] top-10 w-96 h-96 bg-sky-200/25 blur-[120px] rounded-full" aria-hidden />
      <div className="md:hidden flex items-center justify-between p-4 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-sm shrink-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
          <span className="font-black text-slate-800 tracking-tighter">SUPPLYCHAIN</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-400 relative">
             <Bell size={20} />
             {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-white/85 backdrop-blur-2xl border-r border-slate-200/60 transform transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-indigo-100/70' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-full md:shadow-xl md:shadow-indigo-100/60 md:rounded-r-3xl
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center space-x-3 mb-10 px-2 shrink-0">
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100">S</div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-slate-800 tracking-tighter leading-none">SUPPLYCHAIN</span>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">B2B Integration</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 -mr-2 scrollbar-hide">
            {menuItems.map((item) => {
              const hasChildren = !!item.children;
              const isExpanded = expandedMenus.includes(item.id);
              const isActive = (activeTab === item.id) || (item.children?.some(child => child.id === activeTab));

              return (
                <div key={item.id} className="space-y-1">
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
                    <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
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

          <div className="pt-6 mt-6 border-t border-slate-50 shrink-0">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-rose-500 hover:bg-rose-50 transition-all group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0 relative">
        <header className="hidden md:flex items-center justify-end px-10 py-5 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shrink-0 relative z-50 shadow-sm">
          <div className="flex items-center space-x-6">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) markNotificationsAsRead();
                }}
                className={`p-2.5 rounded-xl transition-all relative ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="px-6 py-5 bg-indigo-600 text-white flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Notification Center</h4>
                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-[9px] font-black">{myNotifications.length} Total</span>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {myNotifications.length === 0 ? (
                      <div className="p-12 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {myNotifications.map(n => (
                          <div key={n.id} className={`p-5 flex gap-4 transition-colors ${n.read ? 'bg-white' : 'bg-indigo-50/30'}`}>
                            <div className="mt-1">{getNotifIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-800 mb-1">{n.title}</p>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-2">{n.message}</p>
                              <p className="text-[9px] font-black text-slate-300 flex items-center gap-1.5">
                                <Clock size={10} /> {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1"></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {myNotifications.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                      <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        View All Activity
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{user?.name}</p>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{user?.role}</p>
              </div>
              <img src={user?.avatar} alt="Profile" className="w-10 h-10 rounded-2xl ring-4 ring-slate-50 shadow-md object-cover" />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden transition-all" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
