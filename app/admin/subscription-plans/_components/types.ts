export interface SubscriptionPlan {
    id: number;
    code: string;
    name: string;
    cycle: "monthly" | "yearly";
    price_vnd: number;
    vip_duration_days: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
