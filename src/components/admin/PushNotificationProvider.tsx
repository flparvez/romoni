 'use client';

    import { urlBase64ToUint8Array } from '@/lib/utils';
    import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

    interface PushContextType {
      subscribe: () => Promise<void>;
      isSubscribed: boolean;
      isSubscribing: boolean;
    }

    const PushNotificationContext = createContext<PushContextType | undefined>(undefined);

    export const PushNotificationProvider = ({ children }: { children: ReactNode }) => {
      const [isSubscribed, setIsSubscribed] = useState(false);
      const [isSubscribing, setIsSubscribing] = useState(false);
      const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

      useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          navigator.serviceWorker.register('/service-worker.js').then(swReg => {
            setRegistration(swReg);
            swReg.pushManager.getSubscription().then(subscription => {
              if (subscription) {
                setIsSubscribed(true);
              }
            });
          });
        }
      }, []);

      const subscribe = async () => {
        if (!registration || isSubscribed) return;

        setIsSubscribing(true);
        try {
          const applicationServerKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });

          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          });

          setIsSubscribed(true);
        } catch (error) {
          console.error('Failed to subscribe the user: ', error);
        }
        setIsSubscribing(false);
      };

      return (
        <PushNotificationContext.Provider value={{ subscribe, isSubscribed, isSubscribing }}>
          {children}
        </PushNotificationContext.Provider>
      );
    };

    export const usePushNotifications = () => {
      const context = useContext(PushNotificationContext);
      if (context === undefined) {
        throw new Error('usePushNotifications must be used within a PushNotificationProvider');
      }
      return context;
    };