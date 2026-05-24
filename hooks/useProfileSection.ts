// src/hooks/useProfileSection.ts
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";
import toast from "react-hot-toast";

// Ép kiểu T phải luôn có trường id là string
export function useProfileSection<T extends { id: string }>(endpoint: string, refreshTrigger?: number) {
  const [items, setItems] = useState<T[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch dữ liệu ban đầu
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(endpoint);
      setItems(res.data.data);
    } catch (error) {
      console.error(`Lỗi tải dữ liệu từ ${endpoint}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshTrigger]);

  //Logic Lưu (Xử lý cả Thêm mới và Cập nhật)
  const handleSave = async (data: Partial<T>, id?: string | null) => {
    const currentId = id ?? editingId;

    try {
      if (currentId) {
        const res = await apiClient.put(`${endpoint}/${currentId}`, data);
        const updatedItem = res.data.data;

        setItems((prev) =>
          prev.map((e) => (e.id === currentId ? updatedItem : e)),
        );
        if (res.status >= 200 && res.status < 300) {
          toast.success("Cập nhật thành công");
        } else {
          toast.error("Lỗi ,cập nhật không thành công");
        }
      } else {
        const res = await apiClient.post(endpoint, data);
        const newItem = res.data.data;

        setItems((prev) => [newItem, ...prev]);
        if (res.status >= 200 && res.status < 300) {
          toast.success("Thêm mới thành công");
        } else {
          toast.error("Lỗi ,cập nhật không thành công");
        }
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // 3. Logic Xóa
  const handleDelete = async (id: string) => {
    const isConfirm = window.confirm("Bạn có chắc muốn xóa mục này không?");
    if (!isConfirm) return;

    try {
      const res = await apiClient.delete(`${endpoint}/${id}`);
      if (res.status === 200) {
        setItems((prev) => prev.filter((e) => e.id !== id));
        toast.success("Xóa thành công")
      }
    } catch (error) {
      console.error(`Lỗi xóa dữ liệu tại ${endpoint}:`, error);
      toast.error("Lỗi khi xóa")
    }
  };

  // 4. Các hàm Helper điều khiển UI
  const openAddForm = () => {
    setEditingId(null);
    setIsAdding(true);
  };

  const openEditForm = (id: string) => {
    setEditingId(id);
    setIsAdding(true);
  };
  const closeForm = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  return {
    items,
    isAdding,
    editingId,
    isLoading,
    setEditingId,
    handleSave,
    handleDelete,
    openAddForm,
    openEditForm,
    closeForm,
    setIsAdding,
  };
}
