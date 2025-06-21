// DOM Elements
const passwordInputs = document.querySelectorAll('.password-input input[type="password"]');
const showPasswordBtns = document.querySelectorAll('.show-password');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const registerForm = document.querySelector('.register-form');
const loginForm = document.querySelector('.login-form');
const modal = document.createElement('div');
const otpFields = document.querySelectorAll('.otp-field');
const otpTimer;
let timerValue = 30;
let isOtpSent = false;
let otpMessageElement = null;
let registeredName = '';

// Initialize Modal
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <h3>Forgot Password</h3>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        <input type="email" id="forgotEmail" placeholder="Enter your email" required>
        <button class="reset-btn">Send Reset Link</button>
    </div>
`;
document.body.appendChild(modal);

// Helper Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `0${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function createOtpMessage(message, type = 'info') {
    if (!otpMessageElement) {
        otpMessageElement = document.createElement('div');
        otpMessageElement.className = 'otp-message';
        if (type === 'success') {
            otpMessageElement.classList.add('success');
        } else if (type === 'error') {
            otpMessageElement.classList.add('error');
        }
        otpContainer.insertBefore(otpMessageElement, otpContainer.firstChild);
    }
    otpMessageElement.textContent = message;
}

// Password Toggle
showPasswordBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const type = passwordInputs[index].getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInputs[index].setAttribute('type', type);
        btn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
});

// Form Toggle
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (btn.dataset.form === 'register') {
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        } else {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    });
});

// Registration Form
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: document.getElementById('password').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        dob: document.getElementById('dob').value,
        terms: document.getElementById('terms').checked
    };
    
    registeredName = formData.name;
    
    // Validation
    if (!formData.name) {
        showToast('Please enter your full name', 'error');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!formData.phone) {
        showToast('Please enter your phone number', 'error');
        return;
    }
    
    if (!isValidPassword(formData.password)) {
        showToast('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols', 'error');
        return;
    }
    
    if (!formData.gender) {
        showToast('Please select your gender', 'error');
        return;
    }
    
    if (!formData.dob) {
        showToast('Please select your date of birth', 'error');
        return;
    }
    
    if (!formData.terms) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }
    
    showToast('Registration successful! Please login.', 'success');
    
    // Switch to login form
    toggleBtns.forEach(btn => {
        if (btn.dataset.form === 'login') {
            btn.click();
        }
    });
    
    // Pre-fill login email
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.value = formData.email;
    }
});

// Login Form
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!password) {
        showToast('Please enter your password', 'error');
        return;
    }
    
    showToast(`Welcome back, ${registeredName}!`, 'success');
});

// Modal Events
const closeBtn = document.querySelector('.close');
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

const forgotPassword = document.querySelector('.forgot-password');
forgotPassword.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Reset Password Form
const resetBtn = document.querySelector('.reset-btn');
const forgotEmail = document.getElementById('forgotEmail');

resetBtn.addEventListener('click', async () => {
    const email = forgotEmail.value;
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    showToast('Password reset link sent to your email', 'success');
    modal.style.display = 'none';
});

// OTP Verification
const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const otpContainer = document.getElementById('otpContainer');
const timer = document.getElementById('timer');

sendOtpBtn.addEventListener('click', async () => {