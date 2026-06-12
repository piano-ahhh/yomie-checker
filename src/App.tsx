import { useState, useEffect } from 'react';
import { SheetConfig, OrderData } from './types';
import { Header } from './components/Header';
import { SearchBox } from './components/SearchBox';
import { StatusCard } from './components/StatusCard';
import { AdminPanel } from './components/AdminPanel';
import { PasscodeModal } from './components/PasscodeModal';
import { 
  INITIAL_CONFIG, SAMPLE_ORDERS, buildQueryUrl, parseGvizData, normalizeAccount 
} from './sampleData';
import { AlertCircle, FileSpreadsheet, Sparkles } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<SheetConfig>(INITIAL_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('yomie_admin_authenticated') === 'true';
  });
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState("01:46:55");
  
  // Matched orders for lookup
  const [matchedOrders, setMatchedOrders] = useState<OrderData[]>([]);

  // Update clocks cleanly
  const refreshUpdateTime = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setLastUpdated(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
  };

  // Set initial time on boot
  useEffect(() => {
    refreshUpdateTime();
  }, []);

  // Load configuration from local storage on bootstrap
  useEffect(() => {
    const saved = localStorage.getItem('order_checker_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to parse saved config.', e);
      }
    }
  }, []);

  const handleSaveConfig = (newConfig: SheetConfig) => {
    setConfig(newConfig);
    localStorage.setItem('order_checker_config', JSON.stringify(newConfig));
    handleClear();
  };

  const handleResetToDemo = () => {
    setConfig(INITIAL_CONFIG);
    localStorage.removeItem('order_checker_config');
    handleClear();
  };

  const handleClear = () => {
    setSearchQuery('');
    setMatchedOrders([]);
    setErrorText(null);
  };

  const handleOpenSettings = () => {
    if (isAdminAuthenticated) {
      setIsSettingsOpen(true);
    } else {
      setIsPasscodeOpen(true);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('yomie_admin_authenticated');
    setIsSettingsOpen(false);
  };

  const handleRefresh = () => {
    refreshUpdateTime();
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      // Slight feedback toast/alert simulated or just time update
      const infoSpan = document.getElementById("brand-yomie-text");
      if (infoSpan) {
        infoSpan.classList.add("scale-105");
        setTimeout(() => infoSpan.classList.remove("scale-105"), 300);
      }
    }
  };

  const handleSearch = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setSearchQuery(cleanQuery);
    setErrorText(null);
    setMatchedOrders([]);
    setIsLoading(true);
    refreshUpdateTime();

    const normalizedSearch = normalizeAccount(cleanQuery);

    if (config.useFallbackSample) {
      // Searching inside mock data with highly satisfying cute delay
      setTimeout(() => {
        const matches = SAMPLE_ORDERS.filter(o => {
          const accountMatch = normalizeAccount(o.account) === normalizedSearch;
          // Also fallback match check list
          const nameMatch = o.customerName && o.customerName.toLowerCase().includes(cleanQuery.toLowerCase());
          const idMatch = o.orderId && o.orderId.toLowerCase() === cleanQuery.toLowerCase();
          return accountMatch || nameMatch || idMatch;
        });

        if (matches.length > 0) {
          setMatchedOrders(matches);
        } else {
          setMatchedOrders([]);
        }
        setIsLoading(false);
      }, 600);
    } else {
      // Online Real-time sheets fetching
      try {
        const queryUrl = buildQueryUrl(config.spreadsheetId, config.sheetName);
        const res = await fetch(queryUrl);
        if (!res.ok) {
          throw new Error(`Google Sheets endpoint error. Status Code: ${res.status}`);
        }
        const text = await res.text();
        const allRows = parseGvizData(text, config.mapping);
        
        // Match search filters
        const matches = allRows.filter(o => {
          const accountMatch = o.account && normalizeAccount(o.account) === normalizedSearch;
          const nameMatch = o.customerName && o.customerName.toLowerCase().includes(cleanQuery.toLowerCase());
          const idMatch = o.orderId && o.orderId.toLowerCase() === cleanQuery.toLowerCase();
          return accountMatch || nameMatch || idMatch;
        });

        setMatchedOrders(matches);
      } catch (err: any) {
        console.error(err);
        setErrorText(
          "ดึงข้อมูลสั่งซื้อขัดข้อง โปรดตรวจคุณสมบัติ Google Sheets ว่าได้เปิดแชร์แบบ 'ทุกคนที่มีลิงก์ดูได้' และเลือกคอลัมน์ถูกต้องในเมนูร้านค้า"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get unique account keys from samples for quick-start suggestions in SearchBox
  const demoAccounts = Array.from(new Set(SAMPLE_ORDERS.map(o => o.account)));

  return (
    <div className="min-h-screen stripes-bg flex flex-col font-sans text-gray-900 selection:bg-pink-100 selection:text-pink-900 pb-16" id="app-root-layout">
      
      {/* Decorative absolute sparkly stars around on striped canvas background */}
      <div className="absolute top-[180px] left-[8%] animate-sparkle text-yellow-300 opacity-60 hidden lg:block pointer-events-none">
        <svg className="w-9 h-9 fill-[#f9ca3e]" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.2L22 11.6l-5.6 5.4 1.8 7.5L12 20.2l-6.2 4.3 1.8-7.5-5.6-5.4 7.6-2.4z" />
        </svg>
      </div>
      <div className="absolute top-[320px] right-[7%] animate-sparkle text-yellow-300 opacity-75 hidden lg:block pointer-events-none" style={{ animationDelay: "2s" }}>
        <svg className="w-11 h-11 fill-[#ebd57d]" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.2L22 11.6l-5.6 5.4 1.8 7.5L12 20.2l-6.2 4.3 1.8-7.5-5.6-5.4 7.6-2.4z" />
        </svg>
      </div>
      <div className="absolute bottom-[200px] left-[5%] animate-sparkle text-yellow-300 opacity-50 hidden lg:block pointer-events-none" style={{ animationDelay: "1s" }}>
        <svg className="w-7 h-7 fill-[#f9ca3e]" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.2L22 11.6l-5.6 5.4 1.8 7.5L12 20.2l-6.2 4.3 1.8-7.5-5.6-5.4 7.6-2.4z" />
        </svg>
      </div>

      {/* Beautiful header bar */}
      <Header 
        isConfigured={config.isConfigured} 
        onOpenSettings={handleOpenSettings} 
        onRefresh={handleRefresh}
      />

      {/* Main interactive area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-8 flex flex-col justify-center">
        
        {/* If no search has been entered yet, show searchbox centered */}
        {!searchQuery && !isLoading && (
          <div className="space-y-6 pt-5 animate-fade-in" id="search-view-panel">
            <SearchBox 
              onSearch={handleSearch} 
              isLoading={isLoading} 
              onClear={handleClear}
              sampleQueries={demoAccounts} 
            />
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-fade-in" id="loading-panel">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-pink-100 rounded-full"></div>
              <div className="absolute top-0 w-14 h-14 border-4 border-[#eb5e45] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 font-bold font-sans">กำลังดึงข้อมูลและอัปเดต...</p>
          </div>
        )}

        {/* Technical Error Message Box */}
        {!isLoading && errorText && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-150 text-red-800 p-5 rounded-3xl flex items-start space-x-3.5 shadow-sm mt-5" id="error-box">
            <AlertCircle className="w-6 h-6 text-[#eb5e45] flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">การดึงข้อมูลผิดพลาด</h4>
              <p className="text-xs text-red-700 leading-relaxed font-sans">{errorText}</p>
            </div>
          </div>
        )}

        {/* Results Panel */}
        {!isLoading && !errorText && searchQuery && (
          <div className="pt-2">
            {matchedOrders.length === 0 ? (
              /* Case: Not Found */
              <div className="max-w-lg mx-auto bg-white border-4 border-[#eb5e45] rounded-[32px] p-8 text-center space-y-6 shadow-sm relative overflow-hidden" id="not-found-panel">
                <div className="absolute top-4 left-4 text-[#eb5e45] font-mono text-[10px] uppercase font-bold tracking-widest pointer-events-none">
                  YOMIÉ SYSTEM
                </div>
                
                <div className="w-16 h-16 bg-[#fff0f3] rounded-full border border-[#ffe0e6] flex items-center justify-center text-[#db5984] mx-auto">
                  <span className="text-2xl">🧸</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-gray-900 font-sans">ไม่พบรหัสบัญชี "@{searchQuery}"</h3>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed max-w-sm mx-auto">
                    ไม่พบข้อมูลการสั่งซื้อสินค้าพรีออเดอร์ภายใต้ชื่อบัญชีนี้ โปรดสะกดข้อความให้ถี่ถ้วนหรือลองแจ้งทางร้านตรวจสอบเลขนะคะ
                  </p>
                </div>

                <button
                  onClick={handleClear}
                  className="bg-[#eb5e45] text-white font-bold py-2 px-6 rounded-full text-xs shadow-md shadow-red-200 hover:bg-[#db523c] active:scale-95 transition-all cursor-pointer"
                >
                  ย้อนกลับ / BACK
                </button>
              </div>
            ) : (
              /* Case: Found order details beautifully in pre-order tables list */
              <StatusCard 
                orders={matchedOrders} 
                accountName={searchQuery} 
                onBack={handleClear}
                lastUpdatedTime={lastUpdated}
              />
            )}
          </div>
        )}

      </main>

      {/* Admin Panel Drawer component */}
      <AdminPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config} 
        onSaveConfig={handleSaveConfig} 
        onResetToDemo={handleResetToDemo} 
        onLogout={handleLogout}
      />

      {/* Admin Passcode Modal component */}
      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={() => {
          setIsPasscodeOpen(false);
          setIsAdminAuthenticated(true);
          sessionStorage.setItem('yomie_admin_authenticated', 'true');
          setIsSettingsOpen(true);
        }}
      />

    </div>
  );
}
