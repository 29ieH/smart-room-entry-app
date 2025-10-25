window.fcmRegistration = null;
document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname === "/smart-room-entry-app/") {
    console.log("hello redirect !!");
    setTimeout(() => {
      window.location.href = "/smart-room-entry-app/pages/log-access.html";
    }, 300);
  }
  console.log("path:: ", window.location.pathname);
});
