<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
import { ref } from "vue"

// ─── STATE ───────────────────────────────────────────────
const email      = ref("")
const password   = ref("")
const showPass   = ref(false)
const loading    = ref(false)
const error      = ref("")
const rememberMe = ref(false)

// ─── VALIDATION ──────────────────────────────────────────
function validate(): boolean {
  if (!email.value.trim()) {
    error.value = "Please enter your email address."
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = "Please enter a valid email address."
    return false
  }
  if (!password.value) {
    error.value = "Please enter your password."
    return false
  }
  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters."
    return false
  }
  return true
}

// ─── SUBMIT ──────────────────────────────────────────────
async function handleLogin() {
  error.value = ""
  if (!validate()) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 900)) // simulated delay
    // Save token so the router guard recognises the user as logged in
    localStorage.setItem('auth_token', btoa(email.value + ':' + Date.now()))
    router.push('/')
  } catch (e) {
    error.value = "Invalid email or password. Please try again."
  } finally {
    loading.value = false
  }
}

// ─── SOCIAL LOGIN (simulated) ────────────────────────────
async function handleSocialLogin(provider: string) {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    localStorage.setItem('auth_token', btoa(provider + ':' + Date.now()))
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function handleSignUp() {
  error.value = ""
  if (!email.value.trim() || !password.value) {
    error.value = "Please enter your email and choose a password to sign up."
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = "Please enter a valid email address."
    return
  }
  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters."
    return
  }
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 900))
    localStorage.setItem('auth_token', btoa(email.value + ':' + Date.now()))
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Left brand panel (hidden on mobile) -->
    <div class="login-brand" aria-hidden="true">
      <div class="brand-inner">
        <div class="brand-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.15"/>
            <path d="M8 22L14 10L20 18L24 14L28 22H8Z" fill="white"/>
          </svg>
          <span>Phone<em>Mart</em></span>
        </div>
        <h2 class="brand-tagline">Your premium<br>mobile store</h2>
        <p class="brand-sub">Top smartphones. Lightning-fast delivery. Unbeatable deals.</p>

        <div class="brand-stats">
          <div class="stat-item">
            <span class="stat-num">50K+</span>
            <span class="stat-label">Products</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">2M+</span>
            <span class="stat-label">Happy Customers</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">4.9★</span>
            <span class="stat-label">App Rating</span>
          </div>
        </div>

        <!-- Decorative circles -->
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="login-form-wrap">
      <div class="login-card">
        <!-- Mobile logo -->
        <div class="mobile-logo">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#c0392b"/>
            <path d="M8 22L14 10L20 18L24 14L28 22H8Z" fill="white"/>
          </svg>
          <span>Phone<em style="font-style:normal;color:#c0392b">Mart</em></span>
        </div>

        <h1 class="form-title">Welcome back</h1>
        <p class="form-sub">Sign in to your account to continue</p>

        <!-- Error alert -->
        <Transition name="shake">
          <div v-if="error" class="error-alert" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>
        </Transition>

        <form class="login-form" @submit.prevent="handleLogin" novalidate>

          <!-- Email -->
          <div class="field-group">
            <label for="email" class="field-label">Email address</label>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                class="field-input"
                placeholder="you@example.com"
                autocomplete="email"
                :disabled="loading"
                @input="error = ''"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field-group">
            <div class="label-row">
              <label for="password" class="field-label">Password</label>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            <div class="input-wrap">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                class="field-input"
                placeholder="Enter your password"
                autocomplete="current-password"
                :disabled="loading"
                @input="error = ''"
              />
              <button
                type="button"
                class="toggle-pass"
                :aria-label="showPass ? 'Hide password' : 'Show password'"
                @click="showPass = !showPass"
              >
                <!-- Eye icon -->
                <svg v-if="!showPass" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye-off icon -->
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember me -->
          <label class="remember-row">
            <input v-model="rememberMe" type="checkbox" class="remember-check" :disabled="loading" />
            <span class="remember-label">Remember me for 30 days</span>
          </label>

          <!-- Submit -->
          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="!loading">Sign in</span>
            <span v-else class="spinner-wrap">
              <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Signing in…
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider"><span>or continue with</span></div>

        <!-- Social logins -->
        <div class="social-row">
          <button type="button" class="btn-social" :disabled="loading" @click="handleSocialLogin('Google')">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" class="btn-social" :disabled="loading" @click="handleSocialLogin('Facebook')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <p class="signup-cta">
          Don't have an account?
          <a href="#" class="signup-link" @click.prevent="handleSignUp">Create one free</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── PAGE LAYOUT ── */
.login-page {
  min-height: 100vh;
  display: flex;
  font-family: 'DM Sans', sans-serif;
}

/* ── LEFT BRAND PANEL ── */
.login-brand {
  width: 46%;
  background: linear-gradient(145deg, #1c1c1e 0%, #2c2c2e 60%, #3a1a18 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.brand-inner {
  position: relative;
  z-index: 2;
  color: #fff;
  max-width: 380px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 48px;
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.brand-tagline {
  font-family: 'Syne', sans-serif;
  font-size: clamp(28px, 3.5vw, 38px);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 16px;
  color: #fff;
}

.brand-sub {
  font-size: 15px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin-bottom: 48px;
}

.brand-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.15);
}

/* Decorative circles */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.deco-circle-1 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(192,57,43,0.3) 0%, transparent 70%);
  top: -100px;
  right: -120px;
}

.deco-circle-2 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(192,57,43,0.2) 0%, transparent 70%);
  bottom: -60px;
  left: -60px;
}

/* ── RIGHT FORM PANEL ── */
.login-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg, #f5f5f7);
  padding: 40px 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
}

/* Mobile logo (only shows on small screens) */
.mobile-logo {
  display: none;
  align-items: center;
  gap: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text, #1c1c1e);
  margin-bottom: 28px;
}

.form-title {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text, #1c1c1e);
  margin-bottom: 6px;
}

.form-sub {
  font-size: 14px;
  color: var(--muted, #8e8e93);
  margin-bottom: 28px;
}

/* ── ERROR ALERT ── */
.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdf2f0;
  border: 1px solid #f5c6be;
  color: #c0392b;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 20px;
}

/* ── FORM ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-label {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-2, #3a3a3c);
}

.forgot-link {
  font-size: 12.5px;
  color: var(--primary, #c0392b);
  text-decoration: none;
  font-weight: 500;
}
.forgot-link:hover { text-decoration: underline; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 13px;
  color: var(--muted, #8e8e93);
  pointer-events: none;
  flex-shrink: 0;
}

.field-input {
  width: 100%;
  padding: 11px 44px 11px 40px;
  background: var(--white, #fff);
  border: 1.5px solid var(--border, #e5e5ea);
  border-radius: 10px;
  font-size: 14.5px;
  color: var(--text, #1c1c1e);
  font-family: 'DM Sans', sans-serif;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.field-input::placeholder { color: var(--muted, #8e8e93); }

.field-input:focus {
  border-color: var(--primary, #c0392b);
  box-shadow: 0 0 0 3px rgba(192,57,43,0.12);
}

.field-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-pass {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted, #8e8e93);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}
.toggle-pass:hover { color: var(--primary, #c0392b); }

/* ── REMEMBER ME ── */
.remember-row {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.remember-check {
  width: 16px;
  height: 16px;
  accent-color: var(--primary, #c0392b);
  cursor: pointer;
}

.remember-label {
  font-size: 13.5px;
  color: var(--text-2, #3a3a3c);
}

/* ── LOGIN BUTTON ── */
.btn-login {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, var(--primary, #c0392b), var(--primary-lt, #e74c3c));
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(192,57,43,0.35);
  transition: opacity 0.2s, transform 0.2s;
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  animation: spin 0.9s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── DIVIDER ── */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  color: var(--muted, #8e8e93);
  font-size: 12.5px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border, #e5e5ea);
}

/* ── SOCIAL BUTTONS ── */
.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px;
  background: var(--white, #fff);
  border: 1.5px solid var(--border, #e5e5ea);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text, #1c1c1e);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}

.btn-social:hover:not(:disabled) {
  border-color: var(--primary, #c0392b);
  background: var(--primary-bg, #fdf2f0);
}

.btn-social:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── SIGN UP LINK ── */
.signup-cta {
  text-align: center;
  font-size: 13.5px;
  color: var(--muted, #8e8e93);
}

.signup-link {
  color: var(--primary, #c0392b);
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}
.signup-link:hover { text-decoration: underline; }

/* ── TRANSITION ── */
.shake-enter-active { animation: shake 0.38s ease; }

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ── DARK MODE ── */
html.dark .login-form-wrap { background: var(--bg, #0a0a0c); }
html.dark .form-title       { color: var(--text, #f2f2f7); }
html.dark .field-input      { background: var(--white, #161618); border-color: var(--border, #2c2c2e); color: var(--text, #f2f2f7); }
html.dark .field-input:focus { border-color: var(--primary, #c0392b); box-shadow: 0 0 0 3px rgba(192,57,43,0.2); }
html.dark .btn-social       { background: var(--white, #161618); border-color: var(--border, #2c2c2e); color: var(--text, #f2f2f7); }
html.dark .btn-social:hover:not(:disabled) { background: var(--primary-bg, #2a0f0c); }
html.dark .error-alert      { background: #2a0f0c; border-color: #5a2020; }
html.dark .login-card .mobile-logo { color: var(--text, #f2f2f7); }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .login-brand  { display: none; }
  .mobile-logo  { display: flex; }
  .login-form-wrap { padding: 32px 20px; }
}
</style>