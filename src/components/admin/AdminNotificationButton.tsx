'use client';

import { usePushNotifications } from "../PushNotificationProvider";



    export default function AdminNotificationButton() {
      const { subscribe, isSubscribed, isSubscribing } = usePushNotifications();
      return (
        <button
          onClick={() => subscribe()}
          disabled={isSubscribed || isSubscribing}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubscribed ? 'Notifications Enabled' : 'Enable Order Notifications'}
        </button>
      );
    }