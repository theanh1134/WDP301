// API Service for Authentication
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService';

const API_BASE_URL = 'http://localhost:9999/api';

class AuthService {
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Send verification email via frontend EmailJS
            if (data.data && data.data.verificationCode) {
                try {
                    await sendVerificationEmail({
                        email: data.data.email,
                        fullName: data.data.fullName,
                        code: data.data.verificationCode
                    });
                    console.log('✅ Verification email sent via EmailJS');

                    // Show appropriate message based on whether it's a resend
                    if (data.data.isResend) {
                        console.log('📧 Verification code resent for existing unverified account');
                    }
                } catch (emailError) {
                    console.error('❌ Failed to send verification email:', emailError);
                    // Don't throw error, just log it
                }
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async verifyEmail(email, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Email verification failed');
            }

            return data;
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    }

    async resendCode(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Resend code failed');
            }

            // Send verification email via frontend EmailJS
            if (data.data && data.data.verificationCode) {
                try {
                    await sendVerificationEmail({
                        email: email,
                        fullName: data.data.fullName,
                        code: data.data.verificationCode
                    });
                    console.log('✅ Resend verification email sent via EmailJS');
                } catch (emailError) {
                    console.error('❌ Failed to send resend verification email:', emailError);
                    // Don't throw error, just log it
                }
            }

            return data;
        } catch (error) {
            console.error('Resend code error:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token in localStorage
            if (data.data && data.data.token) {
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Forgot password failed');
            }

            // Send password reset email via frontend EmailJS
            if (data.data && data.data.resetCode) {
                try {
                    await sendPasswordResetEmail({
                        email: email,
                        fullName: data.data.fullName,
                        code: data.data.resetCode
                    });
                    console.log('✅ Password reset email sent via EmailJS');
                } catch (emailError) {
                    console.error('❌ Failed to send password reset email:', emailError);
                    // Don't throw error, just log it
                }
            }

            return data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    async verifyResetCode(email, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Reset code verification failed');
            }

            return data;
        } catch (error) {
            console.error('Reset code verification error:', error);
            throw error;
        }
    }

    async resetPassword(email, code, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password reset failed');
            }

            return data;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export default new AuthService();

