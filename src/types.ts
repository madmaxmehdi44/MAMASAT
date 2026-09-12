export interface Source {
  id: number | string;
  title: string;
  url: string;
  referer?: string | null;
  origin?: string | null;
  country?: string | null;
  vip?: boolean;
}

export interface Channel {
  id: number;
  catId?: number;
  name: string;
  nameEn?: string;
  image?: string | null;
  url: string;
  referer?: string | null;
  origin?: string | null;
  vpn: boolean;
  iran: boolean;
  popular: number;
  vip: boolean;
  category: string;
  categoryEn?: string;
  satellite?: string | null;
  frequency?: string | null;
  polarization?: string | null;
  symbolRate?: string | null;
  subscribers?: string;
  viewers?: number;
  description?: string;
  sources: Source[];
}

export type CategoryFilter = {
  id: string;
  label: string;
  iconName?: string;
};

export type ActiveTab = 'home' | 'explore' | 'live' | 'favorites' | 'history' | 'radio' | 'satellite';
