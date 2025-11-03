
export interface Car {
  id: string;
  name: string;
  plate: string;
}

export interface AnalyzedReceiptData {
  vendor: string | null;
  date: string | null;
  total: number | null;
  description: string | null;
}

export interface Receipt extends AnalyzedReceiptData {
  id: string;
  car: Car;
}
