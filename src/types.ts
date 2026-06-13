export interface ColumnMapping {
  account: number;       // Column index (e.g. 0 for A)
  item: number;          // Column index
  price: number;         // Column index
  shipping: number;      // Column index
  total: number;         // Column index for total
  paid: number;          // Column index
  balance: number;       // Column index
  status: number;        // Column index
  orderId: number;       // Column index for classic mapping compatibility
  customerName: number;  // Column index
  phone: number;         // Column index
  date: number;          // Column index
  notes: number;         // Column index
  deliveryInfo: number;  // Column index for shipping information (e.g. Column K)
}

export interface OrderData {
  account: string;      // e.g. "wi"
  item: string;         // e.g. "audred bad tank top"
  price: string;        // e.g. "300"
  shipping: string;     // e.g. "45"
  total: string;        // e.g. "345"
  paid: string;         // e.g. "345"
  balance: string;      // e.g. "0"
  status: string;       // e.g. "จัดส่งสำเร็จ"
  
  // Classic/Fallback fields:
  orderId: string;
  customerName: string;
  phone: string;
  date: string;
  notes: string;
  deliveryInfo: string;  // Customer delivery information from Column K
  colBValue?: string;
}

export interface SheetConfig {
  spreadsheetUrl: string;
  spreadsheetId: string;
  sheetName: string;
  mapping: ColumnMapping;
  isConfigured: boolean;
  useFallbackSample: boolean;
}

export type OrderStatusType = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "unknown";
