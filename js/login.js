document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const userNameInput = document.getElementById("userName");
  const passwordInput = document.getElementById("password");
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const baseUrl = "https://smart-room-entry-be-v1-0.onrender.com";
  let isSubmitting = false;
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    setTimeout(() => {
      window.location.href = "/smart-room-entry-fe/pages/log-access.html";
    }, 200);
  }
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50");

    const userName = userNameInput.value.trim();
    const password = passwordInput.value.trim();
    userNameError.classList.add("hidden");
    passwordError.classList.add("hidden");
    serverError.classList.add("hidden");
    let hasError = false;
    if (!userNameInput.value.trim()) {
      userNameError.classList.remove("hidden");
      hasError = true;
    }
    if (!passwordInput.value.trim()) {
      passwordError.classList.remove("hidden");
      hasError = true;
    }
    if (hasError) return;
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        Toastify({
          text: data.message || "Đăng nhập thất bại",
          close: true,
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#f87171",
        }).showToast();
        return;
      }
      Toastify({
        text: "Đăng nhập thành công!",
        close: true,

        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "#4ade80",
      }).showToast();
      localStorage.setItem("accessToken", data.data.token);
      if (window.notificationManager) {
        await window.notificationManager.registerDeviceWithServer(accessToken);
      }
      setTimeout(() => {
        window.location.href = "/smart-room-entry-fe/pages/log-access.html";
      }, 1000);
    } catch (err) {
      Toastify({
        text: "Lỗi kết nối server",
        close: true,

        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#f87171",
      }).showToast();
      console.error(err);
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  });
});
