// ==========================================
// ERIS - Employee Authentication System
// ==========================================

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeOpen = document.querySelector('.eye-open');
    const eyeClosed = document.querySelector('.eye-closed');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// Initialize default employee accounts
function initializeDefaultAccounts() {
    const key = 'r911.accounts';
    const raw = localStorage.getItem(key);
    let accounts = raw ? JSON.parse(raw) : [];
    
    const defaultAccounts = [
        {
            username: 'evan1315',
            password: 'Op123!',
            role: 'operator',
            name: 'Evan Rodriguez',
            email: 'evan.rodriguez@eris.com',
            employeeId: 'OP1315'
        },
        {
            username: 'emma1120',
            password: 'Emt123!',
            role: 'emt',
            name: 'Emma Chen',
            email: 'emma.chen@eris.com',
            employeeId: 'EMT1120'
        },
        {
            username: 'john8900',
            password: 'Mg123!',
            role: 'manager',
            name: 'John Williams',
            email: 'john.williams@eris.com',
            employeeId: 'MG8900'
        }
    ];
    
    defaultAccounts.forEach(defaultAccount => {
        const exists = accounts.some(a => 
            a.username && a.username.toLowerCase() === defaultAccount.username.toLowerCase()
        );
        if (!exists) {
            accounts.push(defaultAccount);
        } else {
            const index = accounts.findIndex(a => 
                a.username && a.username.toLowerCase() === defaultAccount.username.toLowerCase()
            );
            if (index !== -1) {
                accounts[index] = { ...accounts[index], ...defaultAccount };
            }
        }
    });
    
    localStorage.setItem(key, JSON.stringify(accounts));
}

// Form validation
document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultAccounts();
    
    const signinForm = document.getElementById('signinForm');
    if (!signinForm) return;
    
    // Real-time validation
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
    
    field.classList.remove('error');
    clearFieldError(e);
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        showFieldError(field, 'This field is required');
        return false;
    }
    
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
    hideFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>${message}</span>
    `;
    
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
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const role = document.getElementById('role')?.value;
    
    let isValid = true;
    
    if (!username) {
        const field = document.getElementById('username');
        field.classList.add('error');
        showFieldError(field, 'Username is required');
        isValid = false;
    }
    
    if (!password) {
        const field = document.getElementById('password');
        field.classList.add('error');
        showFieldError(field, 'Password is required');
        isValid = false;
    }
    
    if (!role) {
        const field = document.getElementById('role');
        field.classList.add('error');
        showFieldError(field, 'Please select your role');
        isValid = false;
    }
    
    return isValid;
}

// Handle sign in
function handleSignIn() {
    const signinButton = document.querySelector('#signinForm .btn-primary');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');

    if (!usernameInput || !passwordInput || !roleSelect) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const selectedRole = roleSelect.value;

    // Loading state
    if (signinButton) {
        signinButton.classList.add('button-loading');
        const btnText = signinButton.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Signing In...';
    }

    try {
        const key = 'r911.accounts';
        const raw = localStorage.getItem(key);
        const accounts = raw ? JSON.parse(raw) : [];

        const account = accounts.find(a => 
            a.username && a.username.toLowerCase() === username.toLowerCase()
        );

        if (!account) {
            showError('Account not found. Please check your credentials or create an account.');
            resetSignInButton();
            return;
        }

        if (account.password !== password) {
            showError('Incorrect password. Please try again.');
            resetSignInButton();
            return;
        }

        if (account.role !== selectedRole) {
            showError('Selected role does not match your account. Please select the correct role.');
            resetSignInButton();
            return;
        }

        // Store session
        localStorage.setItem('username', account.username);
        
        const currentUser = {
            username: account.username,
            role: account.role,
            name: account.name || account.username,
            email: account.email || '',
            employeeId: account.employeeId || ''
        };
        localStorage.setItem('r911.currentUser', JSON.stringify(currentUser));

        // Success - redirect based on role
        setTimeout(() => {
            switch (account.role) {
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
                    showError('Invalid role configuration.');
                    resetSignInButton();
            }
        }, 500);

    } catch (error) {
        console.error('Sign in error:', error);
        showError('An error occurred during sign in. Please try again.');
        resetSignInButton();
    }
}

// Reset sign in button
function resetSignInButton() {
    const signinButton = document.querySelector('#signinForm .btn-primary');
    if (signinButton) {
        signinButton.classList.remove('button-loading');
        const btnText = signinButton.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Sign In';
    }
}

// Show error message
function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>${message}</span>
    `;
    errorDiv.style.display = 'flex';
    errorDiv.style.alignItems = 'center';
    errorDiv.style.gap = 'var(--space-sm)';
    
    const form = document.getElementById('signinForm');
    if (form) {
        form.appendChild(errorDiv);
    }
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
