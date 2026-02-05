
export interface User {
  telegram_id: string;
  username: string;
  first_name: string;
  last_name: string;
  balance: number;
  total_earned: number;
  today_earnings: number;
  ads_watched: number;
  weekly_ads_watched: number;
  ads_monetag: number;
  ads_adexium: number;
  ads_adsgram: number;
  cpm_clicks: number;
  tasks_completed: number;
  referral_count: number;
  referral_earnings: number;
  wallet_address: string;
  referred_by: string | null;
  referral_bonus_paid?: boolean;
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  last_active: string;
  isAdmin?: boolean;
  interests?: string[];
}

export interface Transaction {
  tx_id: string;
  user_id: string;
  type: 'ad' | 'task' | 'referral' | 'deposit' | 'withdraw' | 'reward';
  amount: number;
  fee: number;
  network?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description: string;
}

export interface Task {
  task_id: string;
  creator_id: string;
  title: string;
  description: string;
  type: 'official' | 'partner' | 'paid';
  link: string;
  reward: number;
  clicks_required: number;
  clicks_done: number;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
}

export interface Withdrawal {
  withdrawal_id: string;
  user_id: string;
  username?: string;
  amount: number;
  fee: number;
  net_amount: number;
  wallet_address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  processed_at?: string;
}

export enum AdNetwork {
  MONETAG = 'monetag',
  ADEXIUM = 'adexium',
  ADSGRAM = 'adsgram'
}
