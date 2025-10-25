document.addEventListener("DOMContentLoaded", async () => {
  const repoBase = "/smart-room-entry-fe";
  if ("serviceWorker" in navigator) {
    console.log("service woker main !!!");
    try {
      const registration = await navigator.serviceWorker.register(
        `${repoBase}/firebase-messaging-sw.js`,
        { scope: `${repoBase}/` }
      );
      console.log("✅ Service Worker registered:", registration.scope);
      window.fcmRegistration = registration; // lưu vào global
      console.log("window fcm 1::", window.fcmRegistration);
    } catch (err) {
      console.error("❌ SW registration failed:", err);
    }
  }
});
