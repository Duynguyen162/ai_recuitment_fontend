"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export interface CompanyProfile {
  id: number;
  name: string;
  logo_url: string | null;
  size: string | null;
  website: string | null;
  description: string | null;
  is_vip: boolean;
  verification_status: string | null;
  vip_remaining_days: number | null;
  created_at: string | null;
}

const defaultCompanyProfile: CompanyProfile = {
  id: 0,
  name: "",
  logo_url: null,
  size: null,
  website: null,
  description: null,
  is_vip: false,
  verification_status: null,
  vip_remaining_days: null,
  created_at: null,
};

export function useCompanyProfile() {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompanyProfile);
  const [loading, setLoading] = useState(true);
  const [hasNoCompany, setHasNoCompany] = useState(false);

  const fetchCompany = async () => {
    try {
      const res = await apiClient.get("/companies/my_company");
      setCompany({ ...defaultCompanyProfile, ...res.data?.data });
      setHasNoCompany(false);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasNoCompany(true);
      }
      console.error("Không thể tải thông tin công ty:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return {
    company,
    isVip: company.is_vip,
    hasNoCompany,
    loading,
    refetch: fetchCompany,
  };
}
