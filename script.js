// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️';
    }
}

// Navigation to call page
function navigateToCall() {
    window.location.href = 'call.html';
}

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const signinForm = document.getElementById('signinForm');
    const signinButton = document.querySelector('.signin-button');
    
    // Add form validation on input
    const inputs = signinForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Form submission
    signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            handleSignIn();
        }
    });
});

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    field.classList.remove('error');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Additional validation for specific fields
    if (field.type === 'email' && value && !isValidEmail(value)) {
        field.classList.add('error');
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (field.id === 'password' && value && value.length < 6) {
        field.classList.add('error');
        showFieldError(field, 'Password must be at least 6 characters');
        return false;
    }
    
    return true;
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    hideFieldError(field);
}

// Show field error message
function showFieldError(field, message) {
    hideFieldError(field); // Remove existing error
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.style.textAlign = 'left';
    
    field.parentNode.appendChild(errorDiv);
}

// Hide field error message
function hideFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Validate entire form
function validateForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;
    
    let isValid = true;
    
    // Validate username
    if (!username) {
        document.getElementById('username').classList.add('error');
        showFieldError(document.getElementById('username'), 'Username is required');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        document.getElementById('password').classList.add('error');
        showFieldError(document.getElementById('password'), 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('password').classList.add('error');
        showFieldError(document.getElementById('password'), 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Validate role
    if (!role) {
        document.getElementById('role').classList.add('error');
        showFieldError(document.getElementById('role'), 'Please select a role');
        isValid = false;
    }
    
    return isValid;
}

// Handle sign in process
function handleSignIn() {
    const signinButton = document.querySelector('.signin-button');
    const role = document.getElementById('role').value;
    
    // Add loading state
    signinButton.classList.add('button-loading');
    signinButton.textContent = 'Signing In...';
    
    // Simulate authentication delay
    setTimeout(() => {
        // Redirect based on role
        switch(role) {
            case 'operator':
                window.location.href = 'operator.html';
                break;
            case 'emt':
                window.location.href = 'emt.html';
                break;
            case 'manager':
                window.location.href = 'manager.html';
                break;
            default:
                showError('Invalid role selected');
                resetSignInButton();
        }
    }, 1500);
}

// Reset sign in button
function resetSignInButton() {
    const signinButton = document.querySelector('.signin-button');
    signinButton.classList.remove('button-loading');
    signinButton.textContent = 'Sign In';
}

// Show error message
function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    errorDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    errorDiv.style.padding = '1rem';
    errorDiv.style.borderRadius = '10px';
    errorDiv.style.marginTop = '1rem';
    errorDiv.style.textAlign = 'center';
    
    const form = document.getElementById('signinForm');
    form.appendChild(errorDiv);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.1) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
    }
    
    .field-error {
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
