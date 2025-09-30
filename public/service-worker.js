self.addEventListener("push", function (event) {
  let data = {
    title: "New Order!",
    body: "A new order has been received.",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Push event data was not valid JSON:", e);
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: data.data || {}, // orderId + customerName যাবে এখানে
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.orderId
    ? `/admin/orders/${event.notification.data.orderId}`
    : "/";

  event.waitUntil(clients.openWindow(url));
});
