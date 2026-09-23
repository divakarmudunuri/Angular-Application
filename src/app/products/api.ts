export const API_URL = 'http://localhost:3000/api';

export interface Audience {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  audience: string;
  name: string;
  planType: string;
  networkSize: string;
  monthlyPremium: number;
  deductible: number;
  copay: number | null;
  coverage: number | null;
  description: string;
}
