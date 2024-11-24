"use client";
import React, { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

interface ProviderProps {
  children: ReactNode;
}

export default function Provider({ children }: ProviderProps) {
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return (
    <div>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </div>
  );
}
