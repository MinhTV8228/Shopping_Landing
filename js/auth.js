/**
 * Authentication functionality for Nõn Sợi website
 * Handles login, register with comprehensive validation
 */

// Hardcoded user data for demonstration
const USERS_DATABASE = [
  {
    id: 1,
    email: 'admin@Nõn Sợi.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'Nõn Sợi',
    phone: '0123456789',
    gender: 'other',
    createdAt: '2024-01-01',
    isActive: true
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'User123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '0987654321',
    gender: 'male',
    createdAt: '2024-01-15',
    isActive: true
  }
];

// Current session user
let currentUser = null;

class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    // Check if user is already logged in
    this.checkCurrentSession();
    
    // Setup form handlers
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupPasswordToggles();
    this.setupSocialButtons();
    
    // Setup real-time validation
    this.setupRealTimeValidation();

    // Setup user dropdown after component load
    this.setupUserDropdown();
  }

  setupUserDropdown() {
    // Wait for header component to load
    setTimeout(() => {
      if (currentUser) {
        this.updateUIForLoggedInUser();
      } else {
        this.updateUIForGuestUser();
      }
    }, 600);
  }

  updateUIForGuestUser() {
    // Update user dropdown for guest (not logged in) state
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
      userDropdown.classList.remove('logged-in');
      
      const dropdownMenu = userDropdown.querySelector('.user-dropdown-menu');
      if (dropdownMenu) {
        dropdownMenu.innerHTML = `
          <a href="login.html" class="dropdown-item">
            <i class="bi bi-box-arrow-in-right"></i>
            Login
          </a>
          <a href="register.html" class="dropdown-item">
            <i class="bi bi-person-plus"></i>
            Register
          </a>
        `;
      }
    }
  }

  // Session Management
  checkCurrentSession() {
    const userData = localStorage.getItem('Nõn Sợi_user');
    if (userData) {
      try {
        currentUser = JSON.parse(userData);
        // Note: updateUIForLoggedInUser() will be called in setupUserDropdown()
      } catch (e) {
        localStorage.removeItem('Nõn Sợi_user');
        currentUser = null;
      }
    } else {
      currentUser = null;
    }
  }

  saveUserSession(user) {
    const userSession = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('Nõn Sợi_user', JSON.stringify(userSession));
    currentUser = userSession;
  }

  logout() {
    localStorage.removeItem('Nõn Sợi_user');
    currentUser = null;
    
    // Đặt lại user dropdown to guest state
    this.updateUIForGuestUser();
    
    window.location.href = 'index.html';
  }

  updateUIForLoggedInUser() {
    // Update user dropdown for logged in state
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown && currentUser) {
      userDropdown.classList.add('logged-in');
      
      // Update dropdown menu items
      const dropdownMenu = userDropdown.querySelector('.user-dropdown-menu');
      if (dropdownMenu) {
        dropdownMenu.innerHTML = `
          <div class="dropdown-item user-info">
            <i class="bi bi-person-circle"></i>
            ${currentUser.firstName} ${currentUser.lastName}
          </div>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <i class="bi bi-person"></i>
            Account
          </a>
          <a href="cart.html" class="dropdown-item">
            <i class="bi bi-bag"></i>
            Đơn hàng
          </a>
          <a href="wishlist.html" class="dropdown-item">
            <i class="bi bi-heart"></i>
            Wishlist
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item" onclick="logout()">
            <i class="bi bi-box-arrow-right"></i>
            Đăng xuất
          </a>
        `;
      }
    }
  }

  // Login Form Setup
  setupLoginForm() {
    const loginForm = $('#loginForm');
    if (!loginForm.length) return;

    // Prevent browser default validation
    loginForm.on('submit', (e) => {
      e.preventDefault();
      
      // Validate form first
      if (this.validateLoginFormFields()) {
        this.handleLogin();
      }
    });

    // Remove required attribute to prevent browser validation tooltips
    loginForm.find('input[required]').on('invalid', function(e) {
      e.preventDefault();
    });
  }

  async handleLogin() {
    const form = $('#loginForm');
    const submitBtn = form.find('.auth-submit');
    const spinner = submitBtn.find('.spinner-border');
    
    // Get form data
    const formData = {
      email: $('#loginEmail').val().trim(),
      password: $('#loginPassword').val(),
      remember: $('#rememberMe').is(':checked')
    };

    // Validate form
    if (!this.validateLoginFormFields()) {
      this.shakeForm(form);
      return;
    }

    // Show loading state
    submitBtn.prop('disabled', true);
    spinner.removeClass('d-none');

    try {
      // Simulate API delay
      await this.delay(1000);

      // Find user in database
      const user = USERS_DATABASE.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase() &&
        u.password === formData.password &&
        u.isActive
      );

      if (!user) {
        throw new Error('Email hoặc mật khẩu không hợp lệ');
      }

      // Lưu session
      this.saveUserSession(user);

      // Show success message
      this.showAlert('Login successful!', 'success', () => {
        window.location.href = 'index.html';
      });

    } catch (error) {
      this.showAlert(error.message, 'error');
      this.shakeForm(form);
    } finally {
      submitBtn.prop('disabled', false);
      spinner.addClass('d-none');
    }
  }

  // Register Form Setup
  setupRegisterForm() {
    const registerForm = $('#registerForm');
    if (!registerForm.length) return;

    registerForm.on('submit', (e) => {
      e.preventDefault();
      
      // Validate form first
      if (this.validateRegisterFormFields()) {
        this.handleRegister();
      }
    });

    // Prevent browser default validation
    registerForm.find('input[required]').on('invalid', function(e) {
      e.preventDefault();
    });

    // Password strength indicator
    $('#registerPassword').on('input', (e) => {
      this.updatePasswordStrength(e.target.value);
    });
  }

  async handleRegister() {
    const form = $('#registerForm');
    const submitBtn = form.find('.auth-submit');
    const spinner = submitBtn.find('.spinner-border');
    
    // Get form data
    const formData = {
      firstName: $('#firstName').val().trim(),
      lastName: $('#lastName').val().trim(),
      email: $('#registerEmail').val().trim(),
      phone: $('#phone').val().trim(),
      password: $('#registerPassword').val(),
      confirmPassword: $('#confirmPassword').val(),
      gender: $('input[name="gender"]:checked').val(),
      agreeTerms: $('#agreeTerms').is(':checked'),
      newsletter: $('#newsletter').is(':checked')
    };

    // Validate form
    if (!this.validateRegisterFormFields()) {
      this.shakeForm(form);
      return;
    }

    // Show loading state
    submitBtn.prop('disabled', true);
    spinner.removeClass('d-none');

    try {
      // Simulate API delay
      await this.delay(1500);

      // Check if email already exists
      const existingUser = USERS_DATABASE.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('This email is already registered');
      }

      // Create new user
      const newUser = {
        id: USERS_DATABASE.length + 1,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        newsletter: formData.newsletter,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Add to database (in real app, this would be API call)
      USERS_DATABASE.push(newUser);

      // Show success message and redirect to login
      this.showAlert('Register thành công! Please login with your new account.', 'success', () => {
        window.location.href = 'login.html';
      });

    } catch (error) {
      this.showAlert(error.message, 'error');
      this.shakeForm(form);
    } finally {
      submitBtn.prop('disabled', false);
      spinner.addClass('d-none');
    }
  }

  // Validate login form fields
  validateLoginFormFields() {
    let isValid = true;
    
    // Email validation
    const email = $('#loginEmail').val().trim();
    if (!email) {
      this.showFieldError('loginEmail', 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showFieldError('loginEmail', 'Invalid email format');
      isValid = false;
    } else {
      this.clearFieldError('loginEmail');
    }

    // Password validation
    const password = $('#loginPassword').val().trim();
    if (!password) {
      this.showFieldError('loginPassword', 'Please enter mật khẩu');
      isValid = false;
    } else {
      this.clearFieldError('loginPassword');
    }

    return isValid;
  }

  // Validate register form fields
  validateRegisterFormFields() {
    let isValid = true;

    // First name validation
    const firstName = $('#firstName').val().trim();
    if (!firstName) {
      this.showFieldError('firstName', 'First name is required');
      isValid = false;
    } else {
      this.clearFieldError('firstName');
    }

    // Last name validation
    const lastName = $('#lastName').val().trim();
    if (!lastName) {
      this.showFieldError('lastName', 'Last name is required');
      isValid = false;
    } else {
      this.clearFieldError('lastName');
    }

    // Email validation
    const email = $('#registerEmail').val().trim();
    if (!email) {
      this.showFieldError('registerEmail', 'Email is required');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showFieldError('registerEmail', 'Invalid email format');
      isValid = false;
    } else {
      this.clearFieldError('registerEmail');
    }

    // Password validation
    const password = $('#registerPassword').val().trim();
    if (!password) {
      this.showFieldError('registerPassword', 'Please enter mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      this.showFieldError('registerPassword', 'Password phải có ít nhất 6 ký tự');
      isValid = false;
    } else {
      this.clearFieldError('registerPassword');
    }

    // Confirm password validation
    const confirmPassword = $('#confirmPassword').val().trim();
    if (!confirmPassword) {
      this.showFieldError('confirmPassword', 'Confirm password is required');
      isValid = false;
    } else if (password !== confirmPassword) {
      this.showFieldError('confirmPassword', 'Password không khớp');
      isValid = false;
    } else {
      this.clearFieldError('confirmPassword');
    }

    // Phone validation
    const phone = $('#phone').val().trim();
    if (!phone) {
      this.showFieldError('phone', 'Phone number is required');
      isValid = false;
    } else {
      this.clearFieldError('phone');
    }

    // Gender validation
    const gender = $('input[name="gender"]:checked').val();
    if (!gender) {
      this.showGenderError('Gender is required');
      isValid = false;
    } else {
      this.clearGenderError();
    }

    // Terms and conditions validation
    const agreeTerms = $('#agreeTerms').is(':checked');
    if (!agreeTerms) {
      this.showFieldError('agreeTerms', 'You must agree to the terms and policies');
      isValid = false;
    } else {
      this.clearFieldError('agreeTerms');
    }

    return isValid;
  }

  // Show field error
  showFieldError(fieldId, message) {
    const field = $(`#${fieldId}`);
    const feedback = field.closest('.form-group').find('.invalid-feedback');
    
    // For checkbox and radio buttons, add error class to the check input
    if (field.is('[type="checkbox"]') || field.is('[type="radio"]')) {
      field.addClass('is-invalid');
    } else {
      field.addClass('is-invalid');
    }
    
    feedback.text(message).addClass('show').show();
  }

  // Clear field error
  clearFieldError(fieldId) {
    const field = $(`#${fieldId}`);
    const feedback = field.closest('.form-group').find('.invalid-feedback');
    
    field.removeClass('is-invalid');
    feedback.removeClass('show').hide();
  }

  // Show gender error
  showGenderError(message) {
    const genderGroup = $('.form-group').has('input[name="gender"]');
    let feedback = genderGroup.find('.invalid-feedback');
    
    // Create feedback element if it doesn't exist
    if (feedback.length === 0) {
      feedback = $('<div class="invalid-feedback"></div>');
      genderGroup.append(feedback);
    }
    
    // Add error styling to radio buttons
    genderGroup.find('input[name="gender"]').addClass('is-invalid');
    feedback.text(message).addClass('show');
  }

  // Clear gender error
  clearGenderError() {
    const genderGroup = $('.form-group').has('input[name="gender"]');
    const feedback = genderGroup.find('.invalid-feedback');
    
    // Remove error styling from radio buttons
    genderGroup.find('input[name="gender"]').removeClass('is-invalid');
    feedback.removeClass('show');
  }

  // Real-time Validation Setup
  setupRealTimeValidation() {
    // Clear errors when user starts typing in any field - use document delegation
    $(document).on('input focus keyup', '#loginEmail, #registerEmail, #loginPassword, #registerPassword, #confirmPassword, #firstName, #lastName, #phone', function() {
      authManager.clearFieldError(this.id);
    });

    // Clear gender error when any gender radio is clicked or changed
    $(document).on('change click focus', 'input[name="gender"]', function() {
      authManager.clearGenderError();
    });

    // Clear terms error when checkbox is clicked
    $(document).on('change click focus', '#agreeTerms', function() {
      authManager.clearFieldError('agreeTerms');
    });

    // Email validation - only show error after user stops typing and field has content
    $('#loginEmail, #registerEmail').on('blur', function() {
      const email = $(this).val().trim();
      if (email && !authManager.isValidEmail(email)) {
        authManager.showFieldError(this.id, 'Invalid email format');
      }
    });

    // Password validation - only show error after user stops typing
    $('#loginPassword, #registerPassword').on('blur', function() {
      const password = $(this).val().trim();
      if (this.id === 'registerPassword' && password && password.length < 6) {
        authManager.showFieldError(this.id, 'Password phải có ít nhất 6 ký tự');
      }
    });

    // Phone validation - only show error after user stops typing and field has content
    $('#phone').on('blur', function() {
      const phone = $(this).val().trim();
      if (phone && !authManager.isValidPhone(phone)) {
        authManager.showFieldError(this.id, 'Invalid phone number');
      }
    });

    // Name validation - only show error after user stops typing and field has content
    $('#firstName, #lastName').on('blur', function() {
      const name = $(this).val().trim();
      if (name && (name.length < 2 || !/^[a-zA-ZÀ-ỹ\s]+$/.test(name))) {
        authManager.showFieldError(this.id, 'Name must be at least 2 characters and contain only letters');
      }
    });

    // Confirm password validation - real-time when both passwords have content
    $('#confirmPassword').on('input blur', function() {
      const password = $('#registerPassword').val();
      const confirmPassword = $(this).val();
      
      if (confirmPassword.length > 0 && password.length > 0) {
        if (password !== confirmPassword) {
          authManager.showFieldError('confirmPassword', 'Password không khớp');
        } else {
          authManager.clearFieldError('confirmPassword');
        }
      }
    });

    // Also validate confirm password when main password changes
    $('#registerPassword').on('input', function() {
      const password = $(this).val();
      const confirmPassword = $('#confirmPassword').val();
      
      if (confirmPassword.length > 0) {
        if (password !== confirmPassword) {
          authManager.showFieldError('confirmPassword', 'Password không khớp');
        } else {
          authManager.clearFieldError('confirmPassword');
        }
      }
    });

    // Gender validation - clear error when selected
    $('input[name="gender"]').on('change', function() {
      authManager.clearGenderError();
    });

    // Terms validation - clear error when checked
    $('#agreeTerms').on('change', function() {
      if ($(this).is(':checked')) {
        authManager.clearFieldError('agreeTerms');
      }
    });
  }

  // Password Toggle Setup
  setupPasswordToggles() {
    $('.password-toggle').on('click', function() {
      const targetId = $(this).data('target');
      const passwordField = $(`#${targetId}`);
      const icon = $(this).find('i');
      
      if (passwordField.attr('type') === 'password') {
        passwordField.attr('type', 'text');
        icon.removeClass('bi-eye').addClass('bi-eye-slash');
      } else {
        passwordField.attr('type', 'password');
        icon.removeClass('bi-eye-slash').addClass('bi-eye');
      }
    });
  }

  // Social Buttons Setup
  setupSocialButtons() {
    $('.social-btn').on('click', function() {
      const platform = $(this).text().trim();
      authManager.showAlert(`Login with ${platform} will be available soon!`, 'info');
    });
  }

  // Validation Helpers
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  }

  checkPasswordStrength(password) {
    let score = 0;
    let message = '';

    if (!password) {
      return { score: 0, message: 'Enter password' };
    }

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Score interpretation
    if (score < 3) {
      message = 'Need uppercase, lowercase, numbers and special characters';
    } else if (score < 4) {
      message = 'Password khá mạnh';
    } else {
      message = 'Password rất mạnh';
    }

    return { score, message };
  }

  updatePasswordStrength(password) {
    const strength = this.checkPasswordStrength(password);
    const strengthBar = $('.strength-bar');
    const strengthText = $('.strength-text');

    // Remove all classes
    strengthBar.removeClass('weak fair good strong');

    if (strength.score === 0) {
      strengthBar.css('width', '0%');
      strengthText.text('Độ mạnh mật khẩu');
    } else if (strength.score < 3) {
      strengthBar.addClass('weak').css('width', '25%');
      strengthText.text('Weak - ' + strength.message);
    } else if (strength.score < 4) {
      strengthBar.addClass('fair').css('width', '50%');
      strengthText.text('Fair - ' + strength.message);
    } else if (strength.score < 5) {
      strengthBar.addClass('good').css('width', '75%');
      strengthText.text('Good - ' + strength.message);
    } else {
      strengthBar.addClass('strong').css('width', '100%');
      strengthText.text('Very Strong - ' + strength.message);
    }
  }

  // UI Helper Methods
  showFieldError(fieldId, message) {
    const field = $(`#${fieldId}`);
    const feedback = field.closest('.form-group').find('.invalid-feedback');
    
    field.removeClass('is-valid').addClass('is-invalid');
    feedback.text(message).show();
  }

  shakeForm(form) {
    form.addClass('shake');
    setTimeout(() => {
      form.removeClass('shake');
    }, 500);
  }

  showAlert(message, type = 'info', callback = null) {
    const modal = $('#alertModal');
    const title = $('#alertModalTitle');
    const body = $('#alertModalBody');

    // Set title based on type
    if (type === 'success') {
      title.text('Success');
      body.html(`<div class="text-success"><i class="bi bi-check-circle me-2"></i>${message}</div>`);
    } else if (type === 'error') {
      title.text('Error');
      body.html(`<div class="text-danger"><i class="bi bi-exclamation-circle me-2"></i>${message}</div>`);
    } else {
      title.text('Notification');
      body.html(`<div class="text-info"><i class="bi bi-info-circle me-2"></i>${message}</div>`);
    }

    // Show modal
    const modalInstance = new bootstrap.Modal(modal[0]);
    modalInstance.show();

    // Handle callback
    if (callback) {
      modal.on('hidden.bs.modal', callback);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Export for global access
window.AuthManager = authManager;
window.currentUser = currentUser;

// Global logout function
window.logout = () => authManager.logout();





