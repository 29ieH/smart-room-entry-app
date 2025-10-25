importScripts(
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js"
);

console.log("Initial firebase messaging !!!");

firebase.initializeApp({
  apiKey: "AIzaSyCu7Jl2WbKGN2tcUTkJdiX8vGcEUfCDEmE",
  authDomain: "smart-room-7ce2d.firebaseapp.com",
  projectId: "smart-room-7ce2d",
  storageBucket: "smart-room-7ce2d.firebasestorage.app",
  // storageBucket: "smart-room-7ce2d.appspot.com",
  messagingSenderId: "200223892221",
  appId: "1:200223892221:web:4ff537354327e04ac81494",
  measurementId: "G-MX757VXQBX",
});
// Test ngay trong service worker - thêm đoạn này để test
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");

  // Test notification ngay khi service worker active
  setTimeout(() => {
    self.registration
      .showNotification("Test Notification", {
        body: "Nếu bạn thấy này, service worker hoạt động!",
        icon: "https://29ieH.github.io/smart-room-entry-app/public/images/icon_192x192.png",
        tag: "test",
      })
      .then(() => console.log("Test notification shown"))
      .catch((err) => console.log("Test notification failed:", err));
  }, 3000);
});

const messaging = firebase.messaging();
console.log("Messaging:: ", messaging);
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification?.title || "Notification Title";
  const notificationOptions = {
    body: payload.notification?.body || "You have a message",
    icon: "/smart-room-entry-app/public/images/icon_192x192.png",
    badge: "/smart-room-entry-app/public/images/icon_192x192.png",
    tag: "smart-room-notification",
    requireInteraction: true,
  };
  console.log("Send notify with icon path:", notificationOptions.icon);
  return self.registration
    .showNotification(notificationTitle, notificationOptions)
    .then(() => console.log("Popup notification successfully"))
    .catch((error) => console.log("Error showing notification:", error));
});
