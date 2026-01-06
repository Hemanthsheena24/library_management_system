document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const studentBtn = document.getElementById("studentBtn");
    const adminBtn = document.getElementById("adminBtn");
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    let currentRole = "student"; // default role

    // Safety check
    if (!loginForm || !emailInput || !passwordInput) {
        console.error("Login form elements not found");
        return;
    }

    /* =========================
       ROLE TOGGLE
    ========================= */
    if (studentBtn && adminBtn) {
        studentBtn.addEventListener("click", () => {
            currentRole = "student";
            studentBtn.classList.add("active");
            adminBtn.classList.remove("active");
            document.documentElement.style.setProperty(
                "--primary-color",
                "#3b82f6"
            );
        });

        adminBtn.addEventListener("click", () => {
            currentRole = "admin";
            adminBtn.classList.add("active");
            studentBtn.classList.remove("active");
            document.documentElement.style.setProperty(
                "--primary-color",
                "#8b5cf6"
            );
        });
    }

    /* =========================
       LOGIN LOGIC
    ========================= */
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const submitBtn = loginForm.querySelector("button");

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Authenticating...";
        submitBtn.style.opacity = "0.7";
        submitBtn.disabled = true;

        const endpoint =
            currentRole === "student"
                ? "http://localhost:5000/api/students/profile"
                : "http://localhost:5000/api/admin/profile";

        const basicAuth = btoa(email + ":" + password);

        fetch(endpoint, {
            headers: {
                Authorization: "Basic " + basicAuth,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Invalid credentials");
                }
                return res.json();
            })
            .then(() => {
                if (currentRole === "student") {
                    sessionStorage.setItem("studentAuth", basicAuth);
                    window.location.href = "student-dashboard.html";
                } else {
                    sessionStorage.setItem("adminAuth", basicAuth);
                    window.location.href = "librarian-dashboard.html";
                }
            })
            .catch(() => {
                alert("Login failed: Invalid credentials");
                submitBtn.innerText = originalBtnText;
                submitBtn.style.opacity = "1";
                submitBtn.disabled = false;
            });
    });
});
