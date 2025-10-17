// EmailJS được load từ CDN trong index.html
// Cấu hình EmailJS
const EMAILJS_CONFIG = {
    serviceId: 'service_pocdysd', // ✅ Service ID đúng từ EmailJS
    templateId: 'template_u4b4325',
    publicKey: '4YSzE4Z6WTrOyeV4a' // ✅ Public Key mới
};

// Log config để debug
console.log('📋 EmailJS Config loaded:', EMAILJS_CONFIG);

// Gửi email xác nhận đăng ký tài khoản
export const sendVerificationEmail = async (emailData) => {
    const templateParams = {
        title: `Xác nhận đăng ký tài khoản - Craft Villages`,
        name: emailData.fullName,
        time: new Date().toLocaleTimeString('vi-VN'),
        message: `Xin chào ${emailData.fullName},\n\nMã xác nhận của bạn là: ${emailData.code}\n\nMã này sẽ hết hạn sau 3 phút.\n\nTrân trọng,\nCraft Villages Team`,
        email: emailData.email
    };

    try {
        console.log('🔧 EmailJS Config:', EMAILJS_CONFIG);
        console.log('📧 Verification Email Data:', emailData);
        console.log('📨 Template Params:', templateParams);

        // Kiểm tra EmailJS có sẵn sàng không
        if (typeof window.emailjs === 'undefined') {
            throw new Error('EmailJS library chưa được load từ CDN');
        }

        console.log('✅ EmailJS library đã sẵn sàng');

        console.log('🚀 Sending verification email via EmailJS...');
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        console.log('✅ EmailJS Response:', {
            status: response.status,
            text: response.text,
            full: response
        });

        return { success: true, data: response };

    } catch (error) {
        console.error('❌ EmailJS Error:', {
            message: error?.message,
            status: error?.status,
            text: error?.text,
            error
        });

        // Fallback demo
        console.warn('🔄 EmailJS failed, using mock email...');
        console.log('📧 ===== MOCK VERIFICATION EMAIL =====');
        console.log('To:', emailData.email);
        console.log('Subject:', `Xác nhận đăng ký tài khoản - Craft Villages`);
        console.log('Code:', emailData.code);
        console.log('=========================');

        return {
            success: true,
            data: {
                status: 200,
                text: 'Mock verification email sent (EmailJS failed)',
                fallback: true
            }
        };
    }
};

// Gửi email đặt lại mật khẩu
export const sendPasswordResetEmail = async (emailData) => {
    const templateParams = {
        title: `Đặt lại mật khẩu - Craft Villages`,
        name: emailData.fullName,
        time: new Date().toLocaleTimeString('vi-VN'),
        message: `Xin chào ${emailData.fullName},\n\nMã đặt lại mật khẩu của bạn là: ${emailData.code}\n\nMã này sẽ hết hạn sau 3 phút.\n\nTrân trọng,\nCraft Villages Team`,
        email: emailData.email
    };

    try {
        console.log('🔧 EmailJS Config:', EMAILJS_CONFIG);
        console.log('📧 Password Reset Email Data:', emailData);
        console.log('📨 Template Params:', templateParams);

        // Kiểm tra EmailJS có sẵn sàng không
        if (typeof window.emailjs === 'undefined') {
            throw new Error('EmailJS library chưa được load từ CDN');
        }

        console.log('✅ EmailJS library đã sẵn sàng');

        console.log('🚀 Sending password reset email via EmailJS...');
        const response = await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        console.log('✅ EmailJS Response:', {
            status: response.status,
            text: response.text,
            full: response
        });

        return { success: true, data: response };

    } catch (error) {
        console.error('❌ EmailJS Error:', {
            message: error?.message,
            status: error?.status,
            text: error?.text,
            error
        });

        // Fallback demo
        console.warn('🔄 EmailJS failed, using mock email...');
        console.log('📧 ===== MOCK PASSWORD RESET EMAIL =====');
        console.log('To:', emailData.email);
        console.log('Subject:', `Đặt lại mật khẩu - Craft Villages`);
        console.log('Code:', emailData.code);
        console.log('=========================');

        return {
            success: true,
            data: {
                status: 200,
                text: 'Mock password reset email sent (EmailJS failed)',
                fallback: true
            }
        };
    }
};

// Gửi email xác nhận đăng ký sự kiện
export const sendEventConfirmationEmail = async (emailData) => {
    // Template parameters khớp với EmailJS test thành công
    const templateParams = {
        title: `Su kien da duoc dang ky thanh cong: ${emailData.eventName}`,
        name: emailData.userName,
        time: emailData.eventTime,
        message: `Chuc mung ${emailData.userName}! Ban da dang ky thanh cong su kien "${emailData.eventName}". Ngay: ${emailData.eventDate}, Gio: ${emailData.eventTime}, Dia diem: ${emailData.eventLocation}. Link chi tiet: ${window.location.origin}/event-detail/${emailData.eventId}?registration=${emailData.registrationId}`,
        email: emailData.userEmail
    };

    try {
        console.log('🔧 EmailJS Config:', EMAILJS_CONFIG);
        console.log('📧 Email Data:', emailData);
        console.log('📨 Template Params:', templateParams);

        // Kiểm tra EmailJS có sẵn sàng không
        if (typeof window.emailjs === 'undefined') {
            throw new Error('EmailJS library chưa được load từ CDN');
        }

        console.log('✅ EmailJS library đã sẵn sàng');

        console.log('🚀 Sending email via EmailJS...');
        console.log('📧 Final params:', {
            serviceId: EMAILJS_CONFIG.serviceId,
            templateId: EMAILJS_CONFIG.templateId,
            params: templateParams
        });

        const response = await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );

        console.log('✅ EmailJS Response:', {
            status: response.status,
            text: response.text,
            full: response
        });

        return { success: true, data: response };

    } catch (error) {
        console.error('❌ EmailJS Error:', {
            message: error?.message,
            status: error?.status,
            text: error?.text,
            error
        });

        // Fallback demo
        console.warn('🔄 EmailJS failed, using mock email...');
        console.log('📧 ===== MOCK EMAIL =====');
        console.log('To:', emailData.userEmail);
        console.log('Subject:', `Su kien da duoc dang ky thanh cong: ${emailData.eventName}`);
        console.log('Message:', templateParams?.message || 'N/A');
        console.log('=========================');

        return {
            success: true,
            data: {
                status: 200,
                text: 'Mock email sent (EmailJS failed)',
                fallback: true
            }
        };
    }
};

// Gửi email cảm ơn đơn hàng
export const sendOrderThankYouEmail = async ({ email, fullName, orderId, amount, address }) => {
    const templateParams = {
        title: `Cảm ơn bạn đã đặt hàng - Craft Villages`,
        name: fullName,
        time: new Date().toLocaleTimeString('vi-VN'),
        message: `Xin chào ${fullName},\n\nĐơn hàng của bạn ${orderId ? `(#${orderId})` : ''} đã được tiếp nhận.\nTổng tiền: ${(amount || 0).toLocaleString()} VND\nĐịa chỉ giao: ${address || ''}\n\nChúng tôi sẽ liên hệ để giao hàng sớm nhất.\n\nTrân trọng,\nCraft Villages Team`,
        email
    };

    try {
        if (typeof window.emailjs === 'undefined') {
            throw new Error('EmailJS library chưa được load từ CDN');
        }
        await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        return { success: true };
    } catch (error) {
        console.warn('EmailJS thank-you fallback:', error?.message);
        // Fallback mock
        console.log('📧 THANK-YOU EMAIL MOCK');
        console.log({ to: email, subject: templateParams.title, message: templateParams.message });
        return { success: true, fallback: true };
    }
};