import React, { useState, useEffect } from 'react';
import { SheetConfig, ColumnMapping } from '../types';
import { 
  X, HelpCircle, FileSpreadsheet, Sparkles, RefreshCw, 
  Settings2, CheckCircle 
} from 'lucide-react';
import { extractSpreadsheetId, buildQueryUrl, parseGvizData, autoDetectMapping } from '../sampleData';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetConfig;
  onSaveConfig: (newConfig: SheetConfig) => void;
  onResetToDemo: () => void;
  onLogout?: () => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetToDemo,
  onLogout,
}) => {
  const [urlInput, setUrlInput] = useState(config.spreadsheetUrl);
  const [sheetNameInput, setSheetNameInput] = useState(config.sheetName);
  
  // Backing code mapping string state
  const [mappingStr, setMappingStr] = useState<Record<keyof ColumnMapping, string>>({
    account: "B",
    item: "C",
    price: "D",
    shipping: "E",
    paid: "F",
    balance: "G",
    status: "H",
    orderId: "A",
    customerName: "B",
    phone: "B",
    date: "I",
    notes: "J",
    deliveryInfo: "K"
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; rowsCount?: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const TEMPLATE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUU3PTTxGsAH2S9H8wD0/edit";

  // Sync letter indexes
  useEffect(() => {
    const newMappingStr = { ...mappingStr };
    Object.keys(config.mapping).forEach((key) => {
      const idx = config.mapping[key as keyof ColumnMapping];
      if (idx !== undefined && idx >= 0 && idx < ALPHABET.length) {
        newMappingStr[key as keyof ColumnMapping] = ALPHABET[idx];
      }
    });
    setMappingStr(newMappingStr);
    setUrlInput(config.spreadsheetUrl);
    setSheetNameInput(config.sheetName);
    setTestResult(null);
  }, [config, isOpen]);

  if (!isOpen) return null;

  // Convert letter back to index
  const letterToIdx = (letter: string): number => {
    const clean = letter.toUpperCase().trim();
    const alphabetIndex = ALPHABET.indexOf(clean);
    if (alphabetIndex !== -1) return alphabetIndex;
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(TEMPLATE_SHEET_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const spreadsheetId = extractSpreadsheetId(urlInput);
    if (!spreadsheetId) {
      setTestResult({ success: false, message: "❌ รูปแบบลิงก์ Google Sheets ไม่ถูกต้อง" });
      setIsTesting(false);
      return;
    }

    const currentMapping: ColumnMapping = {
      account: letterToIdx(mappingStr.account),
      item: letterToIdx(mappingStr.item),
      price: letterToIdx(mappingStr.price),
      shipping: letterToIdx(mappingStr.shipping),
      paid: letterToIdx(mappingStr.paid),
      balance: letterToIdx(mappingStr.balance),
      status: letterToIdx(mappingStr.status),
      orderId: letterToIdx(mappingStr.orderId),
      customerName: letterToIdx(mappingStr.customerName),
      phone: letterToIdx(mappingStr.phone),
      date: letterToIdx(mappingStr.date),
      notes: letterToIdx(mappingStr.notes),
      deliveryInfo: letterToIdx(mappingStr.deliveryInfo),
    };

    try {
      const queryUrl = buildQueryUrl(spreadsheetId, sheetNameInput);
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const text = await response.text();
      const parsedRows = parseGvizData(text, currentMapping);
      setTestResult({
        success: true,
        message: `✅ เชื่อมต่อทดสอบสำเร็จ! คอนเน็กลิงก์กับ Google Sheets เรียบร้อย`,
        rowsCount: parsedRows.length
      });
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: `❌ เกิดข้อผิดพลาด: โปรดตรวจสอบว่าแชร์ไฟล์เป็น 'Everyone with link can view (ทุกคนที่มีลิงก์ดูได้)' และชื่อชีต '${sheetNameInput}' ถูกต้อง`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleAutoDetect = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const spreadsheetId = extractSpreadsheetId(urlInput);
    if (!spreadsheetId) {
      setTestResult({ success: false, message: "❌ รูปแบบลิงก์ Google Sheets ไม่ถูกต้อง" });
      setIsTesting(false);
      return;
    }

    try {
      const queryUrl = buildQueryUrl(spreadsheetId, sheetNameInput);
      const response = await fetch(queryUrl);
      const text = await response.text();
      
      const startMarker = "google.visualization.Query.setResponse(";
      const startIndex = text.indexOf(startMarker);
      const endMarker = ");";
      const endIndex = text.lastIndexOf(endMarker);
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error("Invalid structure.");
      }
      
      const jsonStr = text.substring(startIndex + startMarker.length, endIndex);
      const data = JSON.parse(jsonStr);
      const cols = data?.table?.cols || []; 
      
      if (cols.length === 0) {
        throw new Error("No columns detected");
      }

      const headers = cols.map((c: any) => c.label || "");
      const detected = autoDetectMapping(headers);

      const newMappingStr = { ...mappingStr };
      Object.keys(detected).forEach((key) => {
        const val = detected[key as keyof ColumnMapping];
        if (val !== undefined && val >= 0 && val < ALPHABET.length) {
          newMappingStr[key as keyof ColumnMapping] = ALPHABET[val];
        }
      });
      setMappingStr(newMappingStr);
      setTestResult({
        success: true,
        message: `✨ จับคู่คอลัมน์อัตโนมัติสำเร็จ! ค้นพบข้อมูลหัวตาราง: [${headers.join(", ")}]`
      });
    } catch (err) {
      console.error(err);
      setTestResult({
        success: false,
        message: "❌ ตรวจจับหัวตารางอัตโนมัติล้มเหลว โปรดตรวจสอบว่าไฟล์มีการตั้งค่าสิทธิ์เรียบร้อยแล้ว"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const spreadsheetId = extractSpreadsheetId(urlInput) || "";
    const activeMapping: ColumnMapping = {
      account: letterToIdx(mappingStr.account),
      item: letterToIdx(mappingStr.item),
      price: letterToIdx(mappingStr.price),
      shipping: letterToIdx(mappingStr.shipping),
      paid: letterToIdx(mappingStr.paid),
      balance: letterToIdx(mappingStr.balance),
      status: letterToIdx(mappingStr.status),
      orderId: letterToIdx(mappingStr.orderId),
      customerName: letterToIdx(mappingStr.customerName),
      phone: letterToIdx(mappingStr.phone),
      date: letterToIdx(mappingStr.date),
      notes: letterToIdx(mappingStr.notes),
      deliveryInfo: letterToIdx(mappingStr.deliveryInfo),
    };

    onSaveConfig({
      spreadsheetUrl: urlInput.trim(),
      spreadsheetId,
      sheetName: sheetNameInput.trim() || "Sheet1",
      mapping: activeMapping,
      isConfigured: !!spreadsheetId,
      useFallbackSample: !spreadsheetId,
    });
    onClose();
  };

  const fieldsDetail: Array<{ key: keyof ColumnMapping; label: string; placeholder: string; desc: string }> = [
    { key: "account", label: "ชื่อบัญชีลูกค้า (Account Name / IG)", placeholder: "A", desc: "คอลัมน์เก็บชื่อไอดีไอจี/ไลน์" },
    { key: "item", label: "รายการพรีออเดอร์ (Product Item)", placeholder: "B", desc: "คอลัมน์เก็บชื่อประเภทที่สินค้า" },
    { key: "price", label: "ราคาสินค้า (Price)", placeholder: "C", desc: "ราคาต้นไม่รวมจัดส่ง" },
    { key: "shipping", label: "ค่าจัดส่งสินค้า (Shipping Fee)", placeholder: "D", desc: "ค่าส่งปลายทางพัสดุ" },
    { key: "paid", label: "ประวัติโอนแล้ว (Paid Amount)", placeholder: "E", desc: "ยอดรวมที่ชำระเข้าบัญชีแล้ว" },
    { key: "balance", label: "ค้างจ่ายคงค้าง (Remaining Balance)", placeholder: "F", desc: "ยอดหนี้ค้างส่งร้านค้า" },
    { key: "status", label: "สถานะสั่งซื้อส่งของ (Order Status)", placeholder: "G", desc: "เช่น จัดส่งสำเร็จ / ถึงไทย / รอกดเว็บ" },
    { key: "orderId", label: "รหัสคำสั่งซื้ออ้างอิง (Order Reference)", placeholder: "H", desc: "เช่น ORD-xxxx" },
    { key: "date", label: "วันที่บันทึกรายการ (Entry Date)", placeholder: "I", desc: "วันที่เพิ่มแถวลงตาราง" },
    { key: "notes", label: "หมายเหตุร้าน (Merchant Note)", placeholder: "J", desc: "รายละเอียดบันทึกเพิ่มเติมถึงผู้ซื้อ" },
    { key: "deliveryInfo", label: "ข้อมูลที่จัดส่งลูกค้า (Shipping Info / Column K)", placeholder: "K", desc: "ที่อยู่จัดส่งหรือข้อมูลจัดส่งปลายทางของลูกค้า" }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="admin-panel-overlay">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-fade-in" 
      />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in" id="admin-panel-drawer">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#f0f2f5] flex items-center justify-between bg-gray-55">
          <div className="flex items-center space-x-2">
            <Settings2 className="w-5 h-5 text-[#eb5e45]" />
            <h3 className="text-base font-bold text-gray-900 tracking-tight font-sans">
              ตั้งค่าฐานข้อมูล & การดึงคอลัมน์
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form elements Scroll Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          
          <div className="bg-[#fef9f7] border border-[#fbebeb] rounded-xl p-4.5 space-y-3">
            <h4 className="text-xs font-bold text-[#eb5e45] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              คำชี้แจงการป้อนข้อมูล
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              1. คัดลอกและเปิดเทมเพลต Google Sheet ปลายทางหลัก<br />
              2. แชร์ปุ่มขวาบนแบบมีสิทธิ์ 'Everyone with the link can view' (ทุกคนที่มีลิงก์ดูได้ เท่านั้น!)เพื่อนำพา APIs ค้นหาสถานะตรงตามเวลาจริงด่วนพิเศษ
            </p>
            <div className="pt-2 border-t border-red-50 flex items-center justify-between">
              <a 
                href={TEMPLATE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#eb5e45] hover:underline font-bold"
              >
                เทมเพลตดาวน์โหลดชีตตัวอย่าง →
              </a>
              <button
                onClick={handleCopyTemplate}
                className="px-2.5 py-1 text-[10px] bg-white border border-[#fcceca] text-[#eb5e45] hover:bg-red-50 rounded font-semibold transition"
              >
                {copiedLink ? "คัดลอกแล้ว!" : "คัดลอกลิงก์ต้นแบบ"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">ลิงก์ Google Sheets (Spreadsheet Link)</label>
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 focus:border-[#eb5e45] focus:ring-1 focus:ring-[#fbebeb] rounded-xl text-gray-900 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">ชื่อแผ่นหน้าชีตย่อย (Tab Name)</label>
              <input
                type="text"
                placeholder="Sheet1"
                value={sheetNameInput}
                onChange={(e) => setSheetNameInput(e.target.value)}
                className="w-full text-xs p-3 border border-gray-200 focus:border-[#eb5e45] focus:ring-1 focus:ring-[#fbebeb] rounded-xl text-gray-900 font-mono"
              />
            </div>
          </div>

          {/* Troubleshoot triggers */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleAutoDetect}
              disabled={isTesting || !urlInput.trim()}
              className="bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-800 disabled:opacity-40 text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              วิเคราะห์คอลัมน์ออโต้
            </button>
            
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !urlInput.trim()}
              className="bg-[#eb5e45]/5 hover:bg-[#eb5e45]/10 border border-[#fddbd4] text-[#eb5e45] disabled:opacity-40 text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#eb5e45] ${isTesting ? 'animate-spin' : ''}`} />
              ทดสอบโหลดพาสข้อมูล
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed font-sans ${
              testResult.success ? 'bg-green-50 border-green-150 text-green-800' : 'bg-red-50 border-red-150 text-red-800'
            }`}>
              {testResult.message}
              {testResult.success && testResult.rowsCount !== undefined && (
                <span className="font-bold block mt-1">จำนวนรายการคิวรีได้เรียลไทม์: {testResult.rowsCount} รายการ!</span>
              )}
            </div>
          )}

          {/* Delineating headers string indexes layout */}
          <div className="border-t border-[#f0f2f5] pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">
                ดัชนีระบุตำแหน่งฟีเจอร์พรีออเดอร์ (A, B, C...)
              </label>
              <span className="text-[10px] text-[#eb5e45] bg-red-50 px-2 py-0.5 rounded font-mono font-bold">
                Column Alphabet Letters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {fieldsDetail.map((f) => (
                <div key={f.key} className="space-y-1 bg-gray-50 border border-gray-150 p-2.5 rounded-xl flex flex-col justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-gray-750 block">{f.label}</label>
                    <span className="text-[10px] text-gray-400 font-sans block pt-0.5 mb-1 leading-tight">{f.desc}</span>
                  </div>
                  <input
                    type="text"
                    maxLength={2}
                    value={mappingStr[f.key] || ""}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setMappingStr({
                        ...mappingStr,
                        [f.key]: val
                      });
                    }}
                    placeholder={f.placeholder}
                    className="w-full text-xs font-bold font-mono text-center uppercase py-1 border border-gray-200 focus:border-[#eb5e45] rounded-lg bg-white text-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer footer buttons */}
        <div className="px-6 py-4 border-t border-[#f0f2f5] flex items-center justify-between bg-gray-55">
          <div className="flex flex-col items-start gap-1">
            <button
              onClick={onResetToDemo}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer text-left"
              type="button"
            >
              ใช้ข้อมูลเดโมสาธิต
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[11px] font-bold text-gray-400 hover:text-red-500 hover:underline cursor-pointer text-left"
                type="button"
              >
                ออกจากระบบแอดมิน (Lock)
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 rounded-xl transition font-bold"
              type="button"
            >
              กลับ
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs bg-[#eb5e45] hover:bg-[#db523c] text-white font-bold rounded-xl shadow-xs transition"
              type="button"
            >
              บันทึกโครงสร้าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
