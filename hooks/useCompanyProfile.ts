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
  created_at: null,
};

export function useCompanyProfile() {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompanyProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await apiClient.get("/companies/my_company");
        setCompany({ ...defaultCompanyProfile, ...res.data?.data });
      } catch (error) {
        console.error("Khong the tai thong tin cong ty:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  return {
    company,
    isVip: company.is_vip,
    loading,
  };
}
