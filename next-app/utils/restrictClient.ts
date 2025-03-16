"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface DecodedToken {
  user: User;
}

// Synchronous function to get user from cookie (client-side only)
const getUserFromCookie = (): User | null => {
  if (typeof document === "undefined") {
    return null; // Prevent execution on server
  }
  const cookies = document.cookie.split("; ");
  const authCookie = cookies.find((cookie) =>
    cookie.startsWith("sb-mmvkkgidcuocgkvxjljd-auth-token=")
  );

  if (!authCookie) {
    return null;
  }

  const cookieValue = authCookie.split("=")[1];
  const encodedToken = cookieValue.startsWith("base64-")
    ? cookieValue.replace("base64-", "")
    : cookieValue;

  try {
    const decodedString = atob(encodedToken);
    const decoded: DecodedToken = JSON.parse(decodedString);
    return decoded.user;
  } catch (error) {
    return null;
  }
};

// Custom hook to retrieve user without role checks
export const useUserFromCookie = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userFromCookie = getUserFromCookie();
    setUser(userFromCookie);
    console.log("Retrieved user from cookie (no role check):", userFromCookie);
  }, []); // Empty dependency array - runs only once on mount

  return user;
};

// Hook for role-based restriction and user retrieval
export const useRestrictClient = (allowedRoles: string[]) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromCookie();

    if (!user) {
      router.push("/protected/general/unauthorized");
      setLoading(false);
      return;
    }

    const role = user.user_metadata?.role;
    if (!allowedRoles.includes(role)) {
      router.push("/protected/general/unauthorized");
      setLoading(false);
    } else {
      console.log("**Client security check : passed**");
      setUser(user);
      setLoading(false);
    }
  }, []); // Empty dependency array - runs only once on mount

  return { user, loading };
};
