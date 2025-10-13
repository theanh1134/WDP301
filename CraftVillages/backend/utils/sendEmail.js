// Backend Email Service - Now handled by frontend EmailJS
// This file is kept for backward compatibility but emails are sent from frontend

const sendEmail = async (emailData) => {
    console.log('📧 ===== EMAIL HANDLED BY FRONTEND =====');
    console.log(`📧 To: ${emailData.email}`);
    console.log(`📝 Subject: ${emailData.subject}`);
    console.log(`📄 Message: ${emailData.message}`);
    console.log(`🔢 Code: ${emailData.code || 'N/A'}`);
    console.log('=========================');
    console.log('ℹ️  Email is now sent via frontend EmailJS service');
    console.log('=========================');

    return {
        success: true,
        message: 'Email handled by frontend EmailJS service',
        data: {
            recipient: emailData.email,
            subject: emailData.subject,
            code: emailData.code,
            handledBy: 'frontend'
        }
    };
};

const sendVerificationEmail = async (email, code, fullName) => {
    const emailData = {
        email,
        subject: 'Xác nhận đăng ký tài khoản - Craft Villages',
        message: `Xin chào ${fullName},\n\nMã xác nhận của bạn là: ${code}\n\nMã này sẽ hết hạn sau 3 phút.\n\nTrân trọng,\nCraft Villages Team`,
        code
    };

    return await sendEmail(emailData);
};

const sendPasswordResetEmail = async (email, code, fullName) => {
    const emailData = {
        email,
        subject: 'Đặt lại mật khẩu - Craft Villages',
        message: `Xin chào ${fullName},\n\nMã đặt lại mật khẩu của bạn là: ${code}\n\nMã này sẽ hết hạn sau 3 phút.\n\nTrân trọng,\nCraft Villages Team`,
        code
    };

    return await sendEmail(emailData);
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};
