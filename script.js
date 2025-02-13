const cardNumber = document.getElementById('card-number');
const cardName = document.getElementById('card-name');
const cardExpiry = document.getElementById('expiry');
const cardDisplay = document.getElementById('card-display');
const nameDisplay = document.getElementById('name-display');
const expiryDisplay = document.getElementById('expiry-display');
const cardLogos = {
    visa: document.getElementById('visa-logo'),
    master: document.getElementById('master-logo'),
    rupay: document.getElementById('rupay-logo'),
    amex: document.getElementById('amex-logo')
};

function detectCardType(number) {
    const cleaned = number.replace(/\D/g, '');
    const cardPreview = document.getElementById('card-preview');
    const cardTypeIcon = document.querySelector('.card-type-icon');
    
    // Hide all card logos initially
    Object.values(cardLogos).forEach(logo => {
        logo.style.display = 'none';
        logo.classList.remove('active');
    });
    
    // Remove all existing card type classes
    cardPreview.classList.remove('visa', 'mastercard', 'rupay', 'amex');
    cardTypeIcon.classList.remove('valid', 'invalid');
    
    // If no number entered, return early
    if (!cleaned) {
        return null;
    }
    
    let cardType = null;
    
    // Updated Rupay detection pattern - check this first
    if (/^(508|60|65|81|82|353|356|6521|6522)/.test(cleaned)) {
        cardType = 'rupay';
        cardLogos.rupay.style.display = 'block';
    } else if (/^4/.test(cleaned)) {
        cardType = 'visa';
        cardLogos.visa.style.display = 'block';
    } else if (/^5[1-5]/.test(cleaned)) {
        cardType = 'mastercard';
        cardLogos.master.style.display = 'block';
    } else if (/^3[47]/.test(cleaned)) {
        cardType = 'amex';
        cardLogos.amex.style.display = 'block';
        document.getElementById('cvv').setAttribute('maxlength', '4');
    } else {
        // Reset CVV to 3 digits
        document.getElementById('cvv').setAttribute('maxlength', '3');
    }
    
    if (cardType) {
        cardPreview.classList.add(cardType);
        cardTypeIcon.classList.add('valid');
        // Add subtle animation
        cardPreview.style.transform = 'scale(1.02)';
        setTimeout(() => cardPreview.style.transform = '', 200);
        // Show and highlight the active card logo
        cardLogos[cardType].classList.add('active');
        cardLogos[cardType].style.opacity = '1';
    } else if (cleaned.length > 0) {
        cardTypeIcon.classList.add('invalid');
    }
    
    return cardType;
}

function formatCardNumber(value) {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    const masked = formatted.replace(/(\d{4} ){3}(\d{4})/, '•••• •••• •••• $2');
    return { formatted, masked };
}

cardNumber.addEventListener('input', (e) => {
    const { formatted, masked } = formatCardNumber(e.target.value);
    e.target.value = formatted;
    cardDisplay.textContent = masked;
    
    const cardType = detectCardType(formatted);
    Object.values(cardLogos).forEach(logo => logo.classList.remove('active'));
    if (cardType && cardLogos[cardType]) {
        cardLogos[cardType].classList.add('active');
    }
});

cardName.addEventListener('input', (e) => {
    nameDisplay.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
});

cardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0,2) + '/' + value.slice(2,4);
    }
    e.target.value = value;
    expiryDisplay.textContent = value || 'MM/YY';
});

document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Add validation before processing payment
    if (!validatePaymentForm()) {
        return;
    }
    
    processPayment();
});

function processPayment() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    
    // Simulate payment processing
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        showOTPModal();
    }, 1500);
}

function showOTPModal() {
    const modal = document.getElementById('otp-modal');
    modal.style.display = 'flex';
    
    // Focus on first OTP input
    const firstInput = modal.querySelector('.otp-input');
    if (firstInput) firstInput.focus();
    
    // Start OTP timer
    startOTPTimer();
}

function startOTPTimer() {
    let timeLeft = 30;
    const timerDisplay = document.getElementById('timer');
    const resendButton = document.getElementById('resend-otp');
    
    const timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            resendButton.disabled = false;
        }
    }, 1000);
}

function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => otp += input.value);
    
    if (otp.length === 6) {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';
        
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            document.getElementById('otp-modal').style.display = 'none';
            showSuccessModal();
        }, 2000);
    } else {
        // Show error animation on inputs
        otpInputs.forEach(input => {
            input.style.borderColor = '#ff4757';
            setTimeout(() => {
                input.style.borderColor = '#e0e0e0';
            }, 800);
        });
    }
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const transactionId = generateTransactionId();
    
    document.getElementById('transaction-id').textContent = transactionId;
    document.getElementById('receipt-transaction-id').textContent = transactionId;
    document.getElementById('receipt-date').textContent = new Date().toLocaleString();
    document.getElementById('receipt-card-number').textContent = 
        document.getElementById('card-number').value.slice(-4).padStart(16, '•');
    
    modal.style.display = 'flex';
}

function generateTransactionId() {
    return 'TXN' + Date.now().toString().slice(-8) + 
           Math.random().toString(36).substr(2, 5).toUpperCase();
}

// OTP input handling
document.querySelectorAll('.otp-input').forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value) {
            const next = input.nextElementSibling;
            if (next) next.focus();
            
            // Check if all inputs are filled
            const allInputsFilled = Array.from(document.querySelectorAll('.otp-input'))
                .every(input => input.value.length === 1);
            
            if (allInputsFilled) {
                verifyOTP();
            }
        }
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value) {
            const prev = input.previousElementSibling;
            if (prev) prev.focus();
        }
    });
});

// Handle resend OTP
document.getElementById('resend-otp').addEventListener('click', () => {
    document.getElementById('resend-otp').disabled = true;
    startOTPTimer();
});

// Initialize
window.addEventListener('load', () => {
    // Hide all card logos initially
    Object.values(cardLogos).forEach(logo => {
        logo.style.display = 'none';
        logo.classList.remove('active');
    });
});

// Add new validation function
function validatePaymentForm() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardName = document.getElementById('card-name').value.trim();
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    
    let isValid = true;

    // Clear any existing error messages first
    clearErrors();

    // Validate Card Number
    if (!cardNumber || cardNumber.length < 15 || cardNumber.length > 16) {
        showError('card-number', 'Please enter a valid card number');
        highlightError('card-number');
        isValid = false;
    }

    // Validate Card Name
    if (!cardName) {
        showError('card-name', 'Please enter the cardholder name');
        highlightError('card-name');
        isValid = false;
    }

    // Validate Expiry
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        showError('expiry', 'Please enter a valid expiry date (MM/YY)');
        highlightError('expiry');
        isValid = false;
    } else {
        // Check if card is not expired
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const cardDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        
        if (cardDate < currentDate) {
            showError('expiry', 'Card has expired');
            highlightError('expiry');
            isValid = false;
        }
    }

    // Validate CVV
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
        showError('cvv', 'Please enter a valid CVV');
        highlightError('cvv');
        isValid = false;
    }

    return isValid;
}

function showError(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ff4757';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    // Insert error message after the input field
    inputElement.parentNode.appendChild(errorDiv);
}

function clearErrors() {
    // Remove all existing error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
}

function highlightError(elementId) {
    const element = document.getElementById(elementId);
    element.style.borderColor = '#ff4757';
    element.style.backgroundColor = '#ffe8e8';
    
    setTimeout(() => {
        element.style.borderColor = '#e2e8f0';
        element.style.backgroundColor = 'rgba(247, 250, 252, 0.8)';
    }, 3000);
}

// Add input event listeners to clear errors when user starts typing
['card-number', 'card-name', 'expiry', 'cvv'].forEach(inputId => {
    document.getElementById(inputId).addEventListener('input', function() {
        // Remove error message for this specific input
        const errorMessage = this.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        // Reset input styling
        this.style.borderColor = '#e2e8f0';
        this.style.backgroundColor = 'rgba(247, 250, 252, 0.8)';
    });
});
