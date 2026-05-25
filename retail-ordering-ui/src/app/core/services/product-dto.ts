export interface ProductDto {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  brand: string;
  imageUrl: string;
  availableStock: number;
  lowStockThreshold: number;
  sizeOptionsJson: string;
  toppingOptionsJson: string;
  isAvailable: boolean;
  isStockLow: boolean;
}

export interface SizeOption {
  Name: string;
  PriceModifier: number;
}

export interface ToppingOption {
  Name: string;
  Price: number;
}
