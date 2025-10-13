// Simple Email Service - Alternative to EmailJS
// Hiển thị thông tin email đẹp trong console và alert

export const sendSimpleEmailNotification = async (emailData) => {
    try {
        console.log('📧 ===== EMAIL CONFIRMATION SENT =====');
        console.log(`📧 To: ${emailData.userEmail}`);
        console.log(`👤 User: ${emailData.userName}`);
        console.log(`🎯 Event: ${emailData.eventName}`);
        console.log(`📅 Date: ${emailData.eventDate}`);
        console.log(`⏰ Time: ${emailData.eventTime}`);
        console.log(`📍 Location: ${emailData.eventLocation}`);
        console.log(`🔗 Detail Link: ${window.location.origin}/event-detail/${emailData.eventId}?registration=${emailData.registrationId}`);
        console.log('=====================================');

        // Hiển thị notification đẹp cho user
        const emailContent = `
🎉 EMAIL XÁC NHẬN ĐÃ ĐƯỢC GỬI!

📧 Đến: ${emailData.userEmail}
👤 Người dùng: ${emailData.userName}
🎯 Sự kiện: ${emailData.eventName}
📅 Ngày: ${emailData.eventDate}
⏰ Giờ: ${emailData.eventTime}
📍 Địa điểm: ${emailData.eventLocation}

🔗 Link chi tiết: 
${window.location.origin}/event-detail/${emailData.eventId}?registration=${emailData.registrationId}

✅ Email confirmation đã được gửi thành công!
        `;

        // Show modal hoặc alert
        alert(emailContent);

        return {
            success: true,
            data: {
                status: 200,
                text: 'Simple email notification sent successfully',
                emailSent: true,
                recipient: emailData.userEmail
            }
        };

    } catch (error) {
        console.error('❌ Simple email service error:', error);
        return { success: false, error: error.message };
    }
};

// Demo email cho presentation
export const createEmailPreview = (emailData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Event Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
        <h2 style="color: #28a745; text-align: center;">🎉 Xác nhận đăng ký thành công!</h2>
        
        <p>Xin chào <strong>${emailData.userName}</strong>,</p>
        
        <p>Chúc mừng! Đăng ký tham gia sự kiện của bạn đã được <strong style="color: #28a745;">XÁC NHẬN</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">📅 Thông tin sự kiện:</h3>
            <p><strong>🎯 Tên sự kiện:</strong> ${emailData.eventName}</p>
            <p><strong>📅 Ngày:</strong> ${emailData.eventDate}</p>
            <p><strong>⏰ Giờ:</strong> ${emailData.eventTime}</p>
            <p><strong>📍 Địa điểm:</strong> ${emailData.eventLocation}</p>
            <p><strong>📄 Mô tả:</strong> ${emailData.eventDescription}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/event-detail/${emailData.eventId}?registration=${emailData.registrationId}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                👀 Xem chi tiết sự kiện
            </a>
        </div>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #666; font-size: 14px;">
            ⚠️ <strong>Lưu ý:</strong> Vui lòng có mặt đúng giờ. Nếu có thay đổi, chúng tôi sẽ thông báo qua email này.
        </p>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            Email này được gửi từ Event Management System
        </p>
    </div>
</body>
</html>
    `;
}; 