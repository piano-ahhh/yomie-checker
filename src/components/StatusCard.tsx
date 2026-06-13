import React from 'react';
import { OrderData } from '../types';
import { Landmark, ArrowLeft, Coins, CheckCircle, Package, Clock, HelpCircle, MapPin } from 'lucide-react';

interface StatusCardProps {
  orders: OrderData[];
  accountName: string;
  onBack: () => void;
  lastUpdatedTime?: string;
  isRealTimeActive?: boolean;
  isSyncing?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  orders, 
  accountName, 
  onBack,
  lastUpdatedTime = "01:46:55",
  isRealTimeActive = false,
  isSyncing = false
}) => {
  
  // Parse numeric string values securely
  const cleanNumber = (val: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Convert status to appropriate color class styles to match screenshot perfectly!
  const getStatusBadgeStyle = (statusStr: string, dateStr?: string) => {
    const clean = (statusStr || "").trim().toLowerCase();
    
    // Check if status is related to shipping round (contains "เรือ", "รอบ", "บิน")
    const hasDateStr = dateStr && dateStr.trim().length > 0;
    const isShippingRound = clean.includes("เรือ") || clean.includes("รอบ") || clean.includes("บิน");
    const formattedLabel = isShippingRound
      ? (hasDateStr ? `รอบเรือ ${dateStr}` : "รอบเรือ")
      : (statusStr || "เตรียมจัดส่ง");

    if (clean.includes("สำเร็จ") || clean.includes("complete") || clean.includes("success") || clean.includes("เสร็จ")) {
      return {
        bg: "bg-[#f2faf3]",
        border: "border-[#d1f2d9]",
        text: "text-[#4db86f]",
        label: formattedLabel || "จัดส่งสำเร็จ"
      };
    }
    if (clean.includes("ไทย") || clean.includes("thailand") || clean.includes("th") || clean.includes("ถึงไทย")) {
      return {
        bg: "bg-[#edf7fd]",
        border: "border-[#d0ebfc]",
        text: "text-[#3daae0]",
        label: formattedLabel || "ถึงไทย"
      };
    }
    if (clean.includes("ถึงบ้านจีน") || clean.includes("บ้านจีน")) {
      return {
        bg: "bg-[#fff5f5]",
        border: "border-[#feb2b2]",
        text: "text-[#e53e3e]",
        label: formattedLabel || "ถึงบ้านจีน"
      };
    }
    if (clean.includes("รอรวม")) {
      return {
        bg: "bg-[#faf5ff]",
        border: "border-[#e9d5ff]",
        text: "text-[#805ad5]",
        label: formattedLabel || "รอรวม"
      };
    }
    if (clean.includes("รอเว็บจัดส่ง") || clean.includes("เว็บจัดส่ง")) {
      return {
        bg: "bg-[#f1f3f9]",
        border: "border-[#cbd6e2]",
        text: "text-[#627ca3]",
        label: formattedLabel || "รอเว็บจัดส่ง"
      };
    }
    if (clean.includes("รอกด") || clean.includes("กดเว็บ") || clean.includes("pending") || clean.includes("รอดำเนินการ")) {
      return {
        bg: "bg-[#f1f3f9]",
        border: "border-[#cbd6e2]",
        text: "text-[#627ca3]",
        label: formattedLabel || "รอกดเว็บ"
      };
    }
    // Specific custom style for shipping round "รอบเรือ" to make it look beautiful
    if (clean.includes("เรือ") || clean.includes("บิน") || clean.includes("รอบ")) {
      return {
        bg: "bg-[#fffbeb]", // Warm cozy yellow
        border: "border-[#fde68a]", // Soft yellow/amber border
        text: "text-[#b45309]", // Dark amber/brown text for high readability
        label: formattedLabel
      };
    }
    // Default pastel badge
    return {
      bg: "bg-[#fef9f3]",
      border: "border-[#fbe4d1]",
      text: "text-[#d17e3a]",
      label: formattedLabel
    };
  };

  // Calculate incomplete items count
  const incompleteCount = orders.filter(o => {
    const statusText = o.status.toLowerCase();
    // Items that are NOT "จัดส่งสำเร็จ" or "สำเร็จ" count as incomplete
    return !(statusText.includes("สำเร็จ") || statusText.includes("complete") || statusText.includes("success"));
  }).length;

  // Calculate total remaining unpaid balance sum
  const totalBalance = orders.reduce((sum, order) => {
    return sum + cleanNumber(order.balance);
  }, 0);

  // Extract customer's shipping address from Column K:K
  const shippingAddress = orders.find(o => o.deliveryInfo && o.deliveryInfo.trim().length > 0)?.deliveryInfo || "";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in" id="status-results-scene">
      
      {/* Top action row containing pill back button and orange update clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="status-scene-header">
        <button
          onClick={onBack}
          className="flex items-center justify-start space-x-2 bg-[#db5984] hover:bg-[#c2466f] text-white font-bold py-2 px-4 rounded-xl shadow-sm hover:shadow transition-all text-xs sm:text-xs cursor-pointer active:scale-95 text-left self-start"
          id="btn-back-search"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Real-time Google Sheets Sync status badge */}
          {isRealTimeActive ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 shadow-xs transition-all">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isSyncing ? "duration-500" : ""}`}></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{isSyncing ? "กำลังซิงก์สด..." : "Real-time Sync"}</span>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              <span>วิวด้านข้อมูลสาธิต (Demo)</span>
            </div>
          )}

          {/* Coral Orange Update Timer badge */}
          <div className="bg-[#fef5f2] border border-[#fbdcd5] rounded-xl px-4 py-1.5 text-[11px] sm:text-xs font-bold text-[#eb5e45] flex items-center justify-start gap-1.5 shadow-xs text-left">
            <Clock className="w-3.5 h-3.5 text-[#eb5e45]" />
            <span>อัปเดตล่าสุด: {lastUpdatedTime}</span>
          </div>
        </div>
      </div>

      {/* Main Table Styled Card with double coral scalloped frame */}
      <div className="cute-card-frame bg-white overflow-hidden p-6 sm:p-7 relative">
        
        {/* Card Header rows */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#f3f4f6]" id="results-card-meta">
          <div>
            <div className="text-[#eb5e45] font-mono text-[11px] font-bold uppercase tracking-widest leading-none mb-1">
              @YOMIIE_CORE DATABASE
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1c2a38] flex items-center gap-2">
              <span>ACCOUNT:</span>
              <span className="text-[#bf65a2] wavy-underline">{accountName || '@unknown'}</span>
            </h1>
          </div>

          {/* Incomplete Item Count Tag Badge */}
          <div className="bg-[#fdf3f0] border border-[#f9dbd4] rounded-xl px-4.5 py-3 text-left shadow-xs">
            <div className="text-xs text-[#203148] font-bold font-sans flex flex-col items-start">
              <span className="text-[#64748b] text-[11px] sm:text-xs tracking-wide">รายการที่ยังไม่เสร็จสิ้น / INCOMPLETE</span>
              <span className="mt-1.5 flex items-baseline gap-1" id="incomplete-count-container">
                <strong className="text-[#eb5e45] text-xl sm:text-2xl font-black tracking-tight">{incompleteCount}</strong>{' '}
                <span className="text-xs sm:text-sm text-[#203148] font-extrabold pb-0.5">รายการ</span>
              </span>
            </div>
          </div>
        </div>

        {/* Orders List Table Container */}
        <div className="overflow-x-auto mt-3.5" id="results-table-scroller">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">date</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">ITEM</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">PRICE</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">SHIPPING</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">TOTAL</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">PAID</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left">BALANCE</th>
                <th className="py-1 px-2 text-[10.5px] sm:text-[11px] font-black text-[#8898a9] uppercase tracking-wider font-mono text-left whitespace-nowrap">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord, idx) => {
                const sStyle = getStatusBadgeStyle(ord.status, ord.date);
                const hasBalance = cleanNumber(ord.balance) > 0;
                
                return (
                  <tr 
                    key={idx} 
                    className="border-b border-[#f4f6f8] hover:bg-gray-50/50 transition-colors"
                  >
                    {/* DATE column */}
                    <td className="py-1.5 px-2 text-[11px] sm:text-xs font-semibold text-[#1c2a38] font-mono text-left whitespace-nowrap">
                      {ord.orderId || '-'}
                    </td>
                     
                    {/* ITEM description */}
                    <td className="py-1.5 px-2 text-[11px] sm:text-xs font-medium text-[#4a5568] font-sans whitespace-nowrap max-w-[200px] truncate text-left" title={ord.item}>
                      {ord.item || '-'}
                    </td>
                     
                    {/* PRICE column */}
                    <td className="py-1.5 px-2 text-[11px] sm:text-xs font-semibold text-[#2d3748] text-left font-mono">
                      ฿{cleanNumber(ord.price)}
                    </td>
                     
                    {/* SHIPPING price */}
                    <td className="py-1.5 px-2 text-[11px] sm:text-xs font-semibold text-[#718096] text-left font-mono">
                      ฿{cleanNumber(ord.shipping)}
                    </td>

                    {/* TOTAL price (Price + Shipping / Cell F) */}
                    <td className="py-1.5 px-2 text-[11px] sm:text-xs font-bold text-[#4f46e5] text-left font-mono">
                      ฿{ord.total ? cleanNumber(ord.total) : (cleanNumber(ord.price) + cleanNumber(ord.shipping))}
                    </td>
                     
                    {/* PAID column */}
                    <td className="py-1.5 px-2 text-[11px] sm:text-xs font-bold text-[#10b981] text-left font-mono">
                      ฿{cleanNumber(ord.paid)}
                    </td>
                     
                    {/* BALANCE remaining */}
                    <td className={`py-1.5 px-2 text-[11px] sm:text-xs font-black text-left font-mono ${
                      hasBalance ? 'text-[#f04444]' : 'text-[#718096]'
                    }`}>
                      ฿{cleanNumber(ord.balance)}
                    </td>
                     
                    {/* STATUS customized rounded color badge */}
                    <td className="py-1.5 px-2 text-left whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${sStyle.bg} ${sStyle.border} ${sStyle.text} tracking-wide whitespace-nowrap`}>
                        {sStyle.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom card widgets info matching Screenshot 2 footer style */}
        <div className="flex flex-col items-end gap-3 pt-8" id="total-remaining-balance-strip">
          {/* Outstanding Balance Box */}
          <div className="w-full sm:max-w-md bg-[#fffdf0] border-2 border-[#fcd34d] rounded-2xl p-4.5 flex items-center justify-between gap-5 shadow-xs">
            <div className="space-y-1.5 flex-1 text-left">
              <span className="text-xs text-[#854d0e] font-extrabold block font-sans tracking-wide">ยอดค้างจ่ายคงเหลือ</span>
              <span className="text-xl sm:text-[23px] font-black text-[#b45309] font-mono tracking-tight leading-none block">
                ฿{totalBalance}
              </span>
            </div>
            
            {/* Round Gold coin icon representing USD/Baht currency symbol */}
            <div className="w-11 h-11 rounded-full bg-[#fef08a] border-2 border-[#fcd34d] flex items-center justify-center text-[#ca8a04] shadow-xs shrink-0">
              <Coins className="w-5.5 h-5.5 text-[#ca8a04] fill-[#fef08a]" />
            </div>
          </div>

          {/* Customer Shipping Address Box (from Column K) */}
          <div className="w-full sm:max-w-md bg-[#f0f9ff] border-2 border-[#7dd3fc] rounded-2xl p-4 flex items-start gap-3.5 shadow-xs transition-all duration-200 hover:border-[#38bdf8]">
            {/* Round Pin icon with soft light blue backgrounds */}
            <div className="w-10 h-10 rounded-full bg-[#e0f2fe] border border-[#bae6fd] flex items-center justify-center text-[#0284c7] shadow-xs shrink-0 pt-0.5">
              <MapPin className="w-5 h-5 text-[#0284c7] fill-[#e0f2fe]" />
            </div>
            <div className="space-y-1 font-sans text-left flex-1 min-w-0">
              <span className="text-xs text-[#0369a1] font-extrabold tracking-wide block">ที่อยู่จัดส่ง</span>
              <p className="text-[12.5px] sm:text-xs font-semibold text-[#1c2a38] break-words leading-relaxed">
                {shippingAddress.trim() || "ยังไม่มีข้อมูลที่จัดส่งในระบบ"}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
