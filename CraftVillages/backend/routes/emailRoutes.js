const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like 'outlook', 'yahoo', etc.
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Your email
        pass: process.env.EMAIL_PASS || 'your-app-password' // Your app password
    }
});

// Send verification email
router.post('/send-verification-email', async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and verification code are required' 
            });
        }

        // Email template
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Mã xác nhận đăng ký người bán - TVCMS',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                        <h2 style="color: #dc3545; margin: 0;">TVCMS - Đăng ký người bán</h2>
                    </div>
                    
                    <div style="padding: 30px; background-color: white;">
                        <h3 style="color: #333; margin-bottom: 20px;">Xác nhận email đăng ký người bán</h3>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Chào mừng bạn đến với TVCMS! Chúng tôi rất vui khi bạn muốn trở thành người bán trên nền tảng của chúng tôi.
                        </p>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác nhận sau:
                        </p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                            <h1 style="color: #dc3545; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">
                                ${verificationCode}
                            </h1>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            <strong>Lưu ý:</strong>
                        </p>
                        <ul style="color: #666; line-height: 1.6;">
                            <li>Mã xác nhận có hiệu lực trong 10 phút</li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này</li>
                        </ul>
                        
                        <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                            Cảm ơn bạn đã tin tưởng TVCMS!
                        </p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                        <p style="margin: 0;">© 2024 TVCMS. Tất cả quyền được bảo lưu.</p>
                        <p style="margin: 5px 0 0 0;">Hòa Lạc, Hà Nội</p>
                    </div>
                </div>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Verification email sent successfully' 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send verification email' 
        });
    }
});

module.exports = router;
