export type UserTier = 'FREE' | 'PRO' | 'SCANNER_BUNDLE';
export type ActionType = 'IN' | 'OUT' | 'DELETE';
export type ScanMode = 'IN' | 'OUT' | 'LOOKUP';

export interface AppUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_seed?: string;
    avatar_url?: string;
    avatar_updated_at?: number;
    tier?: UserTier;
    valid_until?: string;
  };
}

export interface InventorySummary {
  barcode: string;
  owner_id: string;
  quantity: number;
  category?: string;
  name?: string;
  image_url?: string;
  log_id?: string;
}

export interface InventoryLog {
  log_id: string;
  barcode: string;
  action_type: ActionType;
  device_id: string;
  owner_id: string;
  created_at: string;
  quantity: number;
  category?: string;
  name?: string;
  image_url?: string;
}

export interface RegisteredDevice {
  mac_address: string;
  owner_id: string;
  device_label: string;
  last_seen: string;
  ip_address?: string;
}
