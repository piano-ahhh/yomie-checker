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
    orderId: "ORD-001",
    customerName: "wi",
    phone: "@wi",
    date: "2026-06-12",
    notes: ""
  },
  {
    account: "wi",
    item: "cat",
    price: "700",
    shipping: "45",
    paid: "745",
    balance: "0",
    status: "ถึงไทย",
    orderId: "ORD-002",
    customerName: "wi",
    phone: "@wi",
    date: "2026-06-12",
    notes: ""
  },
  {
    account: "wi",
    item: "poooo'น",
    price: "100",
    shipping: "0",
    paid: "100",
    balance: "0",
    status: "รอกดเว็บ",
    orderId: "ORD-003",
    customerName: "wi",
    phone: "@wi",
    date: "2026-06-12",
    notes: ""
  },
  {
    account: "wi",
    item: "audred bad tank top",
    price: "300",
    shipping: "45",
    paid: "300",
    balance: "45",
    status: "จัดส่งสำเร็จ",
    orderId: "ORD-004",
    customerName: "wi",
    phone: "@wi",
    date: "2026-06-12",
    notes: "ค้างจ่ายคงเหลือ 45 บาท"
  },
  {
    account: "wi",
    item: "cat",
    price: "700",
    shipping: "45",
    paid: "745",
    balance: "0",
    status: "ถึงไทย",
    orderId: "ORD-005",
    customerName: "wi",
    phone: "@wi",
    date: "2026-06-12",
    notes: ""
  },
  {
    account: "yomiie",
    item: "cute heart keychain",
    price: "120",
    shipping: "30",
    paid: "150",
    balance: "0",
    status: "จัดส่งสำเร็จ",
    orderId: "ORD-006",
    customerName: "Yomiie",
    phone: "@yomiie",
    date: "2026-06-11",
    notes: "จัดส่งพร้อมแพ็กเกจน่ารักเรียบร้อย"
  }
];

export const DEFAULT_MAPPING: ColumnMapping = {
  account: 0,        // A
  item: 1,           // B
  price: 2,          // C
  shipping: 3,       // D
  paid: 4,           // E
  balance: 5,        // F
  status: 6,         // G
  orderId: 7,        // H
  customerName: 0,   // A
  phone: 0,          // A
  date: 8,           // I
  notes: 9           // J
};

export const INITIAL_CONFIG: SheetConfig = {
  spreadsheetUrl: "",
  spreadsheetId: "",
  sheetName: "Sheet1",
  mapping: DEFAULT_MAPPING,
  isConfigured: false,
  useFallbackSample: true,
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
      account: getCellValue(mapping.account),
      item: getCellValue(mapping.item),
      price: getCellValue(mapping.price),
      shipping: getCellValue(mapping.shipping),
      paid: getCellValue(mapping.paid),
      balance: getCellValue(mapping.balance),
      status: getCellValue(mapping.status),
      orderId: getCellValue(mapping.orderId),
      customerName: getCellValue(mapping.customerName),
      phone: getCellValue(mapping.phone),
      date: getCellValue(mapping.date),
      notes: getCellValue(mapping.notes),
    };
  });
}
