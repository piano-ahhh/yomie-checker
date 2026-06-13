import { OrderData, ColumnMapping, SheetConfig } from './types';

export const DEFAULT_MESSAGES = {
  welcomeTh: "YOMIÉ status",
  subtitleTh: "กรอกชื่อบัญชีเพื่อเช็คประวัติการสั่งซื้อและสถานะ",
  searchPlaceholderTh: "Account",
  searchingTh: "กำลังค้นหาข้อมูล...",
  notFoundTh: "ไม่พบข้อมูลบัญชีนี้",
  notFoundSubTh: "กรุณาตรวจสอบความถูกต้องของชื่อบัญชีอีกครั้ง หรือติดต่อผู้ดูแลระบบเพื่อแจ้งปัญหานะคะ",
  orderFoundTh: "พบข้อมูลสถานะความคืบหน้าเรียบร้อยแล้ว",
};

// Exquisite dataset for demo matching Screenshot 2 perfectly!
export const SAMPLE_ORDERS: OrderData[] = [
  {
    account: "wi",
    item: "audred bad tank top",
    price: "300",
    shipping: "45",
    paid: "345",
    balance: "0",
    status: "จัดส่งสำเร็จ",
    orderId: "12/06/2026",
    customerName: "wi",
    phone: "@wi",
    date: "12/06/2026",
    notes: "",
    deliveryInfo: "99/1 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
  },
  {
    account: "wi",
    item: "cat",
    price: "700",
    shipping: "45",
    paid: "745",
    balance: "0",
    status: "ถึงไทย",
    orderId: "12/06/2026",
    customerName: "wi",
    phone: "@wi",
    date: "12/06/2026",
    notes: "",
    deliveryInfo: "99/1 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
  },
  {
    account: "wi",
    item: "poooo'น",
    price: "100",
    shipping: "0",
    paid: "100",
    balance: "0",
    status: "รอกดเว็บ",
    orderId: "11/06/2026",
    customerName: "wi",
    phone: "@wi",
    date: "11/06/2026",
    notes: "",
    deliveryInfo: "99/1 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
  },
  {
    account: "wi",
    item: "audred bad tank top",
    price: "300",
    shipping: "45",
    paid: "300",
    balance: "45",
    status: "จัดส่งสำเร็จ",
    orderId: "10/06/2026",
    customerName: "wi",
    phone: "@wi",
    date: "10/06/2026",
    notes: "ค้างจ่ายคงเหลือ 45 บาท",
    deliveryInfo: "99/1 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
  },
  {
    account: "wi",
    item: "cat",
    price: "700",
    shipping: "45",
    paid: "745",
    balance: "0",
    status: "ถึงไทย",
    orderId: "09/06/2026",
    customerName: "wi",
    phone: "@wi",
    date: "09/06/2026",
    notes: "",
    deliveryInfo: "99/1 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110"
  },
  {
    account: "yomiie",
    item: "cute heart keychain",
    price: "120",
    shipping: "30",
    paid: "150",
    balance: "0",
    status: "จัดส่งสำเร็จ",
    orderId: "11/06/2026",
    customerName: "Yomiie",
    phone: "@yomiie",
    date: "11/06/2026",
    notes: "จัดส่งพร้อมแพ็กเกจน่ารักเรียบร้อย",
    deliveryInfo: "123 หมู่ 5 ต.บ้านดู่ อ.เมือง จ.เชียงราย 57100"
  }
];

export const DEFAULT_MAPPING: ColumnMapping = {
  account: 1,        // B
  item: 2,           // C
  price: 3,          // D
  shipping: 4,       // E
  paid: 5,           // F
  balance: 6,        // G
  status: 7,         // H
  orderId: 0,        // A (Often serial/No.)
  customerName: 1,   // B
  phone: 1,          // B
  date: 8,           // I
  notes: 9,          // J
  deliveryInfo: 10   // K
};

export const INITIAL_CONFIG: SheetConfig = {
  spreadsheetUrl: "https://docs.google.com/spreadsheets/d/10nsjhgfxjl0sikl8Ellu_1p8cWvzfN_UBgSOFckhKdA/edit?gid=1840635151#gid=1840635151",
  spreadsheetId: "10nsjhgfxjl0sikl8Ellu_1p8cWvzfN_UBgSOFckhKdA",
  sheetName: "", // Leaving empty by default enables automatic tab query (defaults to first worksheet/gid=0)
  mapping: DEFAULT_MAPPING,
  isConfigured: true,
  useFallbackSample: false,
};

/**
 * Extract Spreadsheet ID from Google Sheets URL
 */
export function extractSpreadsheetId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : url;
}

/**
 * Generate Google Sheets Visualization API Query URL
 */
export function buildQueryUrl(spreadsheetId: string, sheetName: string): string {
  if (!sheetName) {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;
  }
  const encSheet = encodeURIComponent(sheetName);
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${encSheet}&tqx=out:json`;
}

/**
 * Normalize account handle for clean matching (removing leading @, spaces)
 */
export function normalizeAccount(accStr: string): string {
  if (!accStr) return "";
  return accStr.trim().toLowerCase().replace(/^@/, "");
}

/**
 * Normalize phone number to facilitate searching (remove hyphens, spaces, etc.)
 */
export function normalizePhone(phoneStr: string): string {
  if(!phoneStr) return "";
  return phoneStr.replace(/[^0-9]/g, "");
}

/**
 * Dynamic mapping detection from row titles (detects English and Thai synonyms)
 */
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = { ...DEFAULT_MAPPING };
  
  const matches = (header: string, synonyms: string[]) => {
    const cleanHeader = header.toLowerCase().trim();
    return synonyms.some(syn => {
      const cleanSyn = syn.toLowerCase();
      // Exact match or partial match
      return cleanHeader.includes(cleanSyn) || cleanSyn.includes(cleanHeader);
    });
  };

  headers.forEach((h, index) => {
    if (matches(h, ["account", "แอคเคาท์", "ชื่อบัญชี", "ลูกค้า", "ig", "line", "แอด", "ชื่อ"])) {
      mapping.account = index;
      mapping.customerName = index;
      mapping.phone = index;
    } else if (matches(h, ["item", "สินค้า", "รายการ", "ของ"])) {
      mapping.item = index;
    } else if (matches(h, ["price", "ราคา", "ยอดขาย"])) {
      mapping.price = index;
    } else if (matches(h, ["shipping", "ค่าส่ง", "ขนส่ง"])) {
      mapping.shipping = index;
    } else if (matches(h, ["paid", "ยอดโอน", "จ่ายแล้ว", "จ่าย"])) {
      mapping.paid = index;
    } else if (matches(h, ["balance", "ค้างจ่าย", "ยอดค้าง", "ค้าง"])) {
      mapping.balance = index;
    } else if (matches(h, ["status", "สถานะ", "ความคืบหน้า"])) {
      mapping.status = index;
    } else if (matches(h, ["order id", "เลขที่", "ไอดี"])) {
      mapping.orderId = index;
    } else if (matches(h, ["date", "วัน", "เวลา"])) {
      mapping.date = index;
    } else if (matches(h, ["notes", "โน้ต", "บันทึก", "หมายเหตุ"])) {
      mapping.notes = index;
    } else if (matches(h, ["delivery", "shipping address", "ที่อยู่", "ที่จัดส่ง", "ที่อยู่จัดส่ง", "address", "ที่จัดส่งลูกค้า", "ข้อมูลที่จัดส่ง"])) {
      mapping.deliveryInfo = index;
    }
  });

  return mapping;
}

/**
 * Parses Google Sheets visualization API JSON text safely
 */
export function parseGvizData(text: string, mapping: ColumnMapping): OrderData[] {
  const startMarker = "google.visualization.Query.setResponse(";
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error("Invalid format returned by Google Sheets endpoint. Make sure 'Anyone with link can view' is enabled.");
  }
  
  const endMarker = ");";
  const endIndex = text.lastIndexOf(endMarker);
  if (endIndex === -1) {
    throw new Error("Invalid formatting closure in sheet request parsing.");
  }

  const jsonStr = text.substring(startIndex + startMarker.length, endIndex);
  const data = JSON.parse(jsonStr);
  
  if (!data?.table?.rows) {
    throw new Error("No data row values were returned in the Google Sheet parsed payload.");
  }

  const cols = data.table.cols || [];
  const rows = data.table.rows || [];

  // SMART AUTO-DETECT: If column labels are available from Google Sheets, use them to dynamically determine the mapping!
  let activeMapping = { ...mapping };
  if (cols.length > 0) {
    const headers = cols.map((c: any) => c.label || "");
    const hasLabels = headers.some(h => h.trim().length > 0);
    if (hasLabels) {
      activeMapping = autoDetectMapping(headers);
    }
  }

  return rows.map((row: any) => {
    const cells = row.c || [];
    
    const getCellValue = (idx: number): string => {
      if (idx === undefined || idx < 0 || idx >= cells.length) return "";
      const cell = cells[idx];
      if (!cell) return "";
      
      if (cell.f !== undefined) return String(cell.f);
      if (cell.v !== undefined) {
        if (cell.v === null) return "";
        return String(cell.v);
      }
      return "";
    };

    return {
      account: getCellValue(activeMapping.account),
      item: getCellValue(activeMapping.item),
      price: getCellValue(activeMapping.price),
      shipping: getCellValue(activeMapping.shipping),
      paid: getCellValue(activeMapping.paid),
      balance: getCellValue(activeMapping.balance),
      status: getCellValue(activeMapping.status),
      orderId: getCellValue(activeMapping.orderId),
      customerName: getCellValue(activeMapping.customerName),
      phone: getCellValue(activeMapping.phone),
      date: getCellValue(activeMapping.date),
      notes: getCellValue(activeMapping.notes),
      deliveryInfo: getCellValue(activeMapping.deliveryInfo !== undefined ? activeMapping.deliveryInfo : 10), // Default to Column K (index 10)
      colBValue: getCellValue(1), // index 1 is Column B
    };
  });
}
