import { useState, useEffect, useCallback } from "react";

/**
 * Hook quản lý location của user với priority cascade:
 * 1. Manual selection từ SearchBar/UI (highest priority)
 * 2. localStorage cached location
 * 3. Browser Geolocation API auto-detect (first time)
 * 4. null - Show all (fallback)
 */

const LOCATION_STORAGE_KEY = "user_preferred_location";
const GEOLOCATION_PERMISSION_KEY = "geolocation_permission_asked";

// Vietnam provinces mapping (simplified - can expand)
const VIETNAM_PROVINCES_MAP = {
  "Hà Nội": ["Hanoi", "Ha Noi", "Thành phố Hà Nội"],
  "Hồ Chí Minh": ["Ho Chi Minh", "Saigon", "Thành phố Hồ Chí Minh"],
  "Đà Nẵng": ["Da Nang", "Thành phố Đà Nẵng"],
  "Hải Phòng": ["Hai Phong", "Thành phố Hải Phòng"],
  "Cần Thơ": ["Can Tho", "Thành phố Cần Thơ"],
};

export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'manual' | 'cached' | 'auto' | null

  /**
   * Normalize province name từ Geolocation API
   */
  const normalizeProvinceName = useCallback((rawProvince) => {
    if (!rawProvince) return null;

    for (const [standard, variants] of Object.entries(VIETNAM_PROVINCES_MAP)) {
      if (
        variants.some((variant) =>
          rawProvince.toLowerCase().includes(variant.toLowerCase())
        )
      ) {
        return standard;
      }
    }

    return rawProvince;
  }, []);

  /**
   * Save location to localStorage
   */
  const saveLocationToStorage = useCallback((locationData) => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    } catch (err) {
      console.error("Failed to save location:", err);
    }
  }, []);

  /**
   * Load location from localStorage
   */
  const loadLocationFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Failed to load location:", err);
      return null;
    }
  }, []);

  /**
   * Reverse geocode using browser's approximation
   * (In production, use Google Maps Geocoding API for accuracy)
   */
  const reverseGeocode = useCallback(
    async (latitude, longitude) => {
      try {
        // Option 1: Use browser's approximation (not accurate)
        // For better accuracy, integrate with Google Maps Geocoding API

        // For demo: Detect major cities by coordinates
        const majorCities = [
          { name: "Thành phố Hà Nội", lat: 21.0285, lng: 105.8542, radius: 50 },
          { name: "Thành phố Hồ Chí Minh", lat: 10.8231, lng: 106.6297, radius: 50 },
          { name: "Thành phố Đà Nẵng", lat: 16.0544, lng: 108.2022, radius: 30 },
          { name: "Thành phố Hải Phòng", lat: 20.8449, lng: 106.6881, radius: 30 },
          { name: "Thành phố Cần Thơ", lat: 10.0452, lng: 105.7469, radius: 30 },
        ];

        // Calculate distance (Haversine formula simplified)
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371; // km
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon2 - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        for (const city of majorCities) {
          const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
          if (distance <= city.radius) {
            return {
              province: city.name,
              ward: null, // Cannot detect ward from coordinates alone
            };
          }
        }

        return null; // Unknown location
      } catch (err) {
        console.error("Reverse geocode failed:", err);
        return null;
      }
    },
    []
  );

  /**
   * Auto-detect location using Browser Geolocation API
   */
  const autoDetectLocation = useCallback(async () => {
    // Check if already asked permission
    const alreadyAsked = localStorage.getItem(GEOLOCATION_PERMISSION_KEY);
    if (alreadyAsked === "denied") {
      return null; // Don't ask again if user denied
    }

    setIsDetecting(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Trình duyệt không hỗ trợ định vị");
        setIsDetecting(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = await reverseGeocode(latitude, longitude);

          if (locationData) {
            setLocation(locationData);
            setSource("auto");
            saveLocationToStorage(locationData);
            localStorage.setItem(GEOLOCATION_PERMISSION_KEY, "granted");
          }

          setIsDetecting(false);
          resolve(locationData);
        },
        (error) => {
          console.error("Geolocation error:", error);
          localStorage.setItem(GEOLOCATION_PERMISSION_KEY, "denied");
          setIsDetecting(false);
          resolve(null);

          if (error.code === error.PERMISSION_DENIED) {
            setError("Bạn đã từ chối quyền truy cập vị trí");
          }
        },
        {
          timeout: 10000,
          maximumAge: 300000, // Cache 5 minutes
          enableHighAccuracy: false,
        }
      );
    });
  }, [reverseGeocode, saveLocationToStorage]);

  /**
   * Manually set location (from SearchBar or user selection)
   */
  const setManualLocation = useCallback(
    (province, ward = null) => {
      const locationData = {
        province: province === "Tất cả" ? null : province,
        ward: ward === "Tất cả" ? null : ward,
      };

      setLocation(locationData);
      setSource("manual");
      saveLocationToStorage(locationData);
    },
    [saveLocationToStorage]
  );

  /**
   * Clear location (show all)
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    setSource(null);
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  }, []);

  /**
   * Initialize location on mount
   */
  useEffect(() => {
    const initLocation = async () => {
      // Priority 1: Check localStorage cache
      const cached = loadLocationFromStorage();
      if (cached && (cached.province || cached.ward)) {
        setLocation(cached);
        setSource("cached");
        return;
      }

      // Priority 2: Auto-detect (only if never asked before)
      const permission = localStorage.getItem(GEOLOCATION_PERMISSION_KEY);
      if (!permission) {
        await autoDetectLocation();
      }
    };

    initLocation();
  }, [loadLocationFromStorage, autoDetectLocation]);

  return {
    location, // { province, ward }
    isDetecting,
    error,
    source, // 'manual' | 'cached' | 'auto' | null
    setManualLocation,
    clearLocation,
    autoDetectLocation, // Expose for manual trigger
  };
}
