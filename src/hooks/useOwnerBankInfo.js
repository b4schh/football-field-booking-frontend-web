import { useState, useEffect } from "react";
import ownerSettingsService from "../services/ownerSettingsService";

/**
 * Custom hook để check bank info status của Owner
 * @returns {Object} { hasBankInfo, loading, error, refetch }
 */
const useOwnerBankInfo = () => {
  const [hasBankInfo, setHasBankInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkBankInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ownerSettingsService.validateBankInfo();
      const isValid = response?.data || false;
      setHasBankInfo(isValid);
    } catch (err) {
      console.error("Error checking bank info:", err);
      setError(err.message || "Không thể kiểm tra thông tin ngân hàng");
      // Default to false nếu có lỗi
      setHasBankInfo(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBankInfo();
  }, []);

  return {
    hasBankInfo,
    loading,
    error,
    refetch: checkBankInfo,
  };
};

export default useOwnerBankInfo;
