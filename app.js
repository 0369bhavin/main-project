// --- Global References ---
const loginModal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
const bookingForm = document.getElementById('booking-form');
const paymentModal = document.getElementById('payment-modal');

const isLoggedInInput = document.getElementById('is-logged-in'); 
const loginPrompt = document.getElementById('login-prompt');
const loginErrorMsg = document.getElementById('login-error-message');
const messageArea = document.getElementById('system-message-area');

const hotelSelect = document.getElementById('hotel-select'); 
const passwordInput = document.getElementById('login-password');
const togglePassword = document.getElementById('togglePassword');


// --- Helper: Display On-Screen Message ---
function displayMessage(message, type = 'success') {
    const msgEl = document.createElement('div');
    msgEl.className = `on-screen-message message-${type}`;
    msgEl.textContent = message;

    messageArea.appendChild(msgEl);
    setTimeout(() => { msgEl.classList.add('show'); }, 10); 

    setTimeout(() => {
        msgEl.classList.remove('show');
        setTimeout(() => { msgEl.remove(); }, 500); 
    }, 5000);
}


// --- 1. MODAL & UI LOGIC ---

// Modal show/hide logic
loginBtn.onclick = function() { loginModal.style.display = 'block'; }
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.onclick = function() { this.closest('.modal').style.display = 'none'; }
});
window.onclick = function(event) {
    if (event.target === loginModal) { loginModal.style.display = 'none'; }
    if (event.target === paymentModal) { paymentModal.style.display = 'none'; }
}

// Password visibility toggle (Eye button)
togglePassword.addEventListener('click', function () {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
});


// --- 2. LOGIN ENFORCEMENT & UI UPDATE ---
function updateBookingUI(isLoggedIn) {
    if (isLoggedIn) {
        // Logged In: Show form, hide prompt
        loginPrompt.style.display = 'none';
        bookingForm.style.display = 'block';
        loginBtn.textContent = 'Logout'; 
        isLoggedInInput.value = 'true';
    } else {
        // Logged Out: Hide form, show prompt
        loginPrompt.style.display = 'block';
        bookingForm.style.display = 'none';
        loginBtn.textContent = 'Login / Sign Up';
        isLoggedInInput.value = 'false';
    }
}
// Initial UI setup
updateBookingUI(false); 


// --- 3. LOGIN VALIDATION & ACTION ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    loginErrorMsg.textContent = ''; 

    const email = document.getElementById('login-email').value;
    const password = passwordInput.value;

    // Client-side Validation Checks
    if (!email.includes('@') || !email.includes('.') || email.length < 5) {
        loginErrorMsg.textContent = "Please enter a valid email address (e.g., user@example.com).";
        return;
    }
    if (password.length < 8) {
        loginErrorMsg.textContent = "Password must be at least 8 characters long.";
        return;
    }
    
    // --- SUCCESSFUL LOGIN SIMULATION ---
    updateBookingUI(true); 
    loginModal.style.display = 'none';
    displayMessage("Welcome! You can now book your table.", 'success');
});

// Implement Logout
loginBtn.addEventListener('click', function() {
    if (isLoggedInInput.value === 'true') {
        updateBookingUI(false);
        displayMessage("You have been logged out.", 'warning');
        loginModal.style.display = 'none'; 
    }
});


// --- 4. BOOKING FORM SUBMISSION ---
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (isLoggedInInput.value !== 'true') {
        displayMessage("Please log in before proceeding to payment.", 'error');
        return;
    }

    if (hotelSelect.value === "") {
        displayMessage("Please select a hotel before proceeding.", 'error');
        return;
    }

    // Proceed to payment
    paymentModal.style.display = 'block';
});


// --- 5. PAYMENT MODAL LOGIC ---
const cardInputs = document.querySelectorAll('input[name="payment-method"]');
const cardDetailsDiv = document.getElementById('card-details');
const paymentForm = document.getElementById('payment-form');
const paymentErrorMsg = document.getElementById('payment-error-message');
const cardNumberInput = document.getElementById('card-number');
const cardExpiryInput = document.getElementById('card-expiry');
const cardCvvInput = document.getElementById('card-cvv');


// Logic to show/hide card details based on radio button selection
cardInputs.forEach(input => {
    input.addEventListener('change', () => {
        const isCardPayment = input.value === 'Credit Card' || input.value === 'Debit Card';
        cardDetailsDiv.style.display = isCardPayment ? 'block' : 'none';
        
        cardNumberInput.required = isCardPayment;
        cardExpiryInput.required = isCardPayment;
        cardCvvInput.required = isCardPayment;
    });
});

function validateCardDetailsSimple() {
    let isValid = true;
    document.querySelectorAll('#card-details .error-message').forEach(el => el.textContent = '');

    const number = cardNumberInput.value.replace(/\s/g, ''); 
    const expiry = cardExpiryInput.value;
    const cvv = cardCvvInput.value;

    if (number.length !== 16 || !/^\d{16}$/.test(number)) {
        document.getElementById('card-number-error').textContent = "Card number must be 16 digits long.";
        isValid = false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        document.getElementById('expiry-error').textContent = "Format must be MM/YY.";
        isValid = false;
    } else {
        const [month, year] = expiry.split('/').map(n => parseInt(n));
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            document.getElementById('expiry-error').textContent = "Card has expired.";
            isValid = false;
        }
    }
    if (!/^\d{3,4}$/.test(cvv)) {
        document.getElementById('cvv-error').textContent = "CVV must be 3 or 4 digits.";
        isValid = false;
    }
    return isValid;
}


paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    paymentErrorMsg.textContent = '';
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    if (paymentMethod === 'COD') {
        displayMessage("Booking confirmed! Payment due at the hotel (COD).", 'success');
        paymentModal.style.display = 'none';
        
    } else if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
        
        if (validateCardDetailsSimple()) {
            displayMessage(`Booking confirmed! Payment processed with ${paymentMethod}.`, 'success');
            paymentModal.style.display = 'none';
        } else {
            paymentErrorMsg.textContent = "Please correct the errors in the card details above.";
        }
    }
});


// --- 6. REVIEW FORM SUBMISSION ---
document.getElementById('review-form').addEventListener('submit', function(e) {
    e.preventDefault();
    displayMessage("Thank you for your review! We value your feedback.", 'success');
    document.getElementById('review-form').reset();
});