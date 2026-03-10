// ---------- ALERT FUNCTION ----------
function showAlert(message, type = "success") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerText = message;
    document.body.prepend(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// ---------- REGISTER ----------
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("regName").value;
        const email = document.getElementById("regEmail").value;
        const phone = document.getElementById("regPhone").value;
        const password = document.getElementById("regPassword").value;

        try {
            const res = await fetch("http://localhost:3000/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await res.json();

            if (res.ok) {
                showAlert(data.message, "success");
                registerForm.reset();
            } else {
                showAlert(data.message, "error");
            }

        } catch (err) {
            console.error(err);
            showAlert("Registration failed", "error");
        }
    });
}


// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const phone = document.getElementById("loginPhone").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const res = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phone, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.name);
                window.location.href = "dashboard.html";
            } else {
                showAlert(data.message, "error");
            }

        } catch (err) {
            console.error(err);
            showAlert("Login failed", "error");
        }
    });
}


// ---------- REQUIRE LOGIN ----------
function requireLogin() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html";
        return false;
    }
    return true;
}


// ---------- GET BALANCE ----------
async function getWalletBalance() {

    if (!requireLogin()) return;

    const token = localStorage.getItem("token");

    try {

        const res = await fetch("http://localhost:3000/api/users/balance", {
            headers: {
                Authorization: token
            }
        });

        const data = await res.json();

        const balanceEl = document.getElementById("balance");

        if (balanceEl) {
            balanceEl.innerText = "Balance: KES " + data.balance;
        }

    } catch (err) {
        console.error(err);
        showAlert("Failed to load balance", "error");
    }
}


// ---------- DEPOSIT ----------
const depositForm = document.getElementById("depositForm");

if (depositForm) {

    depositForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const amount = document.getElementById("depositAmount").value;
        const token = localStorage.getItem("token");

        try {

            const res = await fetch("http://localhost:3000/api/deposit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify({ amount: Number(amount) })
            });

            const data = await res.json();

            if (res.ok) {

                showAlert(data.message, "success");

                document.getElementById("depositAmount").value = "";

                getWalletBalance();
                getTransactions();

            } else {

                showAlert(data.message, "error");

            }

        } catch (err) {

            console.error(err);
            showAlert("Deposit failed", "error");

        }

    });

}


// ---------- SEND MONEY ----------
const sendForm = document.getElementById("sendForm");

if (sendForm) {

    sendForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const receiverPhone = document.getElementById("receiverPhone").value;
        const amount = document.getElementById("sendAmount").value;

        const token = localStorage.getItem("token");

        try {

            const res = await fetch("http://localhost:3000/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify({
                    receiverPhone,
                    amount: Number(amount)
                })
            });

            const data = await res.json();

            if (res.ok) {

                showAlert(data.message, "success");

                document.getElementById("receiverPhone").value = "";
                document.getElementById("sendAmount").value = "";

                getWalletBalance();
                getTransactions();

            } else {

                showAlert(data.message, "error");

            }

        } catch (err) {

            console.error(err);
            showAlert("Transaction failed", "error");

        }

    });

}


// ---------- TRANSACTIONS ----------
async function getTransactions() {

    if (!requireLogin()) return;

    const token = localStorage.getItem("token");

    try {

        const res = await fetch("http://localhost:3000/api/transactions", {
            headers: {
                Authorization: token
            }
        });

        const txs = await res.json();

        const table = document.getElementById("transactionTable");

        if (!table) return;

        table.innerHTML = `
        <tr>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Amount</th>
            <th>Date</th>
        </tr>`;

        txs.forEach(tx => {

            const row = table.insertRow();

            row.insertCell(0).innerText = tx.senderPhone;
            row.insertCell(1).innerText = tx.receiverPhone;
            row.insertCell(2).innerText = tx.amount;
            row.insertCell(3).innerText = new Date(tx.date).toLocaleString();

        });

    } catch (err) {

        console.error(err);
        showAlert("Failed to fetch transactions", "error");

    }
}


// ---------- LOGOUT ----------
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("name");

        window.location.href = "index.html";

    });

}