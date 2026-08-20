export interface CityInfo {
  id: number;
  code: string;
  name: string;
}

export interface UserInfo {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user' | string;
  name: string;
  phone?: string;
  email?: string;
  permissions: string[];
}

export interface LoginResponseData {
  /** 兼容迁移期间后端仍可能返回；前端禁止持久化或用于 Authorization。 */
  token?: string;
  requiresCitySelection: boolean;
  availableCities: CityInfo[];
  currentCity?: CityInfo | null;
  user: UserInfo;
}

export interface AdminUser {
  id: number;
  username: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  status: number;
  lastLoginAt?: string;
  cityIds: number[];
  cities: CityInfo[];
}

export interface AdminUserFormValues {
  username?: string;
  password?: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  status: number;
  cityIds: number[];
}
