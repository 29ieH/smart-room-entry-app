// js/notification-manager.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
  isSupported,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js";
import { firebaseConfig } from "./firebase-config.js";

class NotificationManager {
  constructor() {
    // 🔥 CHẶN MULTIPLE INITIALIZATION
    if (window.__NOTIFICATION_MANAGER_INSTANCE__) {
      return window.__NOTIFICATION_MANAGER_INSTANCE__;
    }
    console.log("🎯 Initializing Notification Manager...");
    this.currentToken = null;
    this.messaging = null;
    this.registration = null;
    this.init();
    window.__NOTIFICATION_MANAGER_INSTANCE__ = this;
  }

  async init() {
    try {
      // 1. Check browser support
      if (!(await this.checkSupport())) {
        console.warn("❌ Browser doesn't support FCM");
        return;
      }

      // 2. Initialize Firebase (ONLY ONCE)
      if (!window.firebaseApp) {
        window.firebaseApp = initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized");
      }

      // 3. Get messaging instance
      this.messaging = getMessaging(window.firebaseApp);

      // 4. Register Service Worker
      await this.registerServiceWorker();

      // 5. Setup message handlers
      this.setupMessageHandlers();

      // 6. Request permission & get token
      await this.requestPermissionAndGetToken();

      console.log("✅ Notification Manager initialized successfully");
    } catch (error) {
      console.error("❌ Notification Manager init failed:", error);
    }
  }

  async checkSupport() {
    return await isSupported();
  }

  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register(
        "/smart-room-entry-fe/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker registered");
      return this.registration;
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      throw error;
    }
  }

  async requestPermissionAndGetToken() {
    try {
      let permission = Notification.permission;

      // Nếu chưa có permission, request từ user
      if (permission === "default") {
        console.log("🔔 Requesting notification permission...");
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        console.log("✅ Notification permission granted");
        const token = await this.getFCMToken();

        // Lưu token vào localStorage để dùng sau khi login
        if (token) {
          localStorage.setItem("fcm_device_token", token);
          console.log("📱 Device Token saved locally");
        }

        return token;
      } else {
        console.warn("⚠️ Notification permission denied:", permission);
        return null;
      }
    } catch (error) {
      console.error("❌ Error requesting permission:", error);
      return null;
    }
  }

  async getFCMToken() {
    try {
      if (!this.messaging || !this.registration) {
        console.warn("❌ Messaging or registration not ready");
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey:
          "BMipruVPD4gzbp3ZnGd4CqgauF6nV4r6hA0_YDuRpJ8aBF7wSq5zN2EMKPPira6GJuCepflf0zpuebDs5n8czII",
        serviceWorkerRegistration: this.registration,
      });

      if (token) {
        this.currentToken = token;
        console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");
        return token;
      } else {
        console.warn("❌ No FCM token available");
        return null;
      }
    } catch (error) {
      console.error("❌ Error getting FCM token:", error);
      return null;
    }
  }

  setupMessageHandlers() {
    // Handle foreground messages (khi app đang mở)
    onMessage(this.messaging, (payload) => {
      console.log("📱 Foreground message received:", payload);

      if (payload.notification) {
        this.showForegroundNotification(
          payload.notification.title,
          payload.notification.body,
          payload.data
        );
      }
    });

    console.log("✅ Message handlers setup completed");
  }

  showForegroundNotification(title, body, data = {}) {
    if (Notification.permission === "granted") {
      const options = {
        body: body,
        icon: "/smart-room-entry-fe/public/images/icon_192x192.png",
        badge: "/smart-room-entry-fe/public/images/icon_192x192.png",
        data: data,
        tag: `foreground-${Date.now()}`,
      };

      const notification = new Notification(title, options);

      // Handle click on notification
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();

        // Navigate if URL provided in data
        if (data.url) {
          window.location.href = data.url;
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // 🔥 HÀM QUAN TRỌNG: Gọi khi user login thành công
  async registerDeviceWithServer(accessToken) {
    try {
      const deviceToken = localStorage.getItem("fcm_device_token");

      if (!deviceToken) {
        console.warn("❌ No device token found in localStorage");
        return false;
      }

      if (!accessToken) {
        console.warn("❌ No access token provided");
        return false;
      }

      console.log("📡 Registering device with server...");

      const response = await fetch(
        "https://smart-room-entry-be-v1-0.onrender.com/notifications/device-token",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: deviceToken,
            platform: "web",
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Device registered successfully with server");
        return true;
      } else {
        console.error("❌ Failed to register device. Status:", response.status);
        return false;
      }
    } catch (error) {
      console.error("❌ Error registering device with server:", error);
      return false;
    }
  }

  async unsubscribe() {
    try {
      if (this.currentToken) {
        await deleteToken(this.messaging);
        this.currentToken = null;
        localStorage.removeItem("fcm_device_token");
        console.log("✅ FCM token deleted and unsubscribed");
      }
    } catch (error) {
      console.error("❌ Error unsubscribing from FCM:", error);
    }
  }

  // Utility methods
  getCurrentToken() {
    return this.currentToken || localStorage.getItem("fcm_device_token");
  }

  getPermissionStatus() {
    return Notification.permission;
  }
}

// 🔥 CHỈ TẠO 1 INSTANCE DUY NHẤT
if (!window.notificationManager) {
  window.notificationManager = new NotificationManager();
}

export default NotificationManager;
