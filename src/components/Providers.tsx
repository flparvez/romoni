"use client";
import { CartProvider } from "@/hooks/useCart";

import { SessionProvider } from "next-auth/react";
import { PushNotificationProvider } from "./PushNotificationProvider";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider> 
 <PushNotificationProvider> 
<CartProvider>
      {children}
      </CartProvider>
</PushNotificationProvider>
    </SessionProvider>
  );
}