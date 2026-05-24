export type FuelEntry = {
  id: string;
  date: string;
  odometer: number;
  liters: number;
  total_cost: number;
  price_per_liter: number;
  station?: string;
  is_full_tank: boolean;
  notes?: string;
  receipt_file_id?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
};

export type CreateFuelEntryInput = {
  date: string;
  odometer: number;
  liters: number;
  total_cost: number;
  station?: string;
  is_full_tank: boolean;
  notes?: string;
  receipt_file_id?: string;
  receipt_url?: string;
};

export type ServiceEntry = {
  id: string;
  date: string;
  odometer: number;
  total_cost: number;
  service_type: string;
  location?: string;
  next_service_odometer?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type CreateServiceEntryInput = {
  date: string;
  odometer: number;
  total_cost: number;
  service_type: string;
  location?: string;
  next_service_odometer?: number;
  notes?: string;
};

export type ExpenseEntry = {
  id: string;
  date: string;
  category: string;
  total_cost: number;
  odometer?: number;
  vendor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type CreateExpenseEntryInput = {
  date: string;
  category: string;
  total_cost: number;
  odometer?: number;
  vendor?: string;
  notes?: string;
};

export type VehicleProfile = {
  id: string;
  make: string;
  model: string;
  trim?: string;
  year?: number;
  license_plate?: string;
  fuel_type?: string;
  transmission?: string;
  engine?: string;
  color?: string;
  created_at: string;
  updated_at: string;
};

export type UpdateVehicleProfileInput = {
  make: string;
  model: string;
  trim?: string;
  year?: number;
  license_plate?: string;
  fuel_type?: string;
  transmission?: string;
  engine?: string;
  color?: string;
};
