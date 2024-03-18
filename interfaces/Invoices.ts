import { ICartItem } from "./Cart";

export interface InvoiceItem {
  item: string;
  description: string;
  quantity: number;
  amountSum: number;
}

export interface Client {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pricePerSession: number;
}

export interface Invoice {
  invoiceNumber: string;
  client: string;
  items: ICartItem[];
  paid?: number;
}
