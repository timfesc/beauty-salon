export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    serviceName,
    servicePrice,
    serviceDuration,
    customerName,
    customerEmail,
    customerPhone,
    bookingDate,
    bookingTime,
    notes,
    bookingSubmissionTime
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !serviceName || !bookingDate || !bookingTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    // Format date for email
    const date = new Date(bookingDate + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send confirmation email to customer
    const customerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: customerEmail,
        subject: `Подтверждение записи в LUMINA: ${serviceName}`,
        html: `
          <!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #3d3d3d; }
              .container { max-width: 600px; margin: 0 auto; background: #f9f8f6; padding: 20px; }
              .header { background: linear-gradient(135deg, #1a1816 0%, #3d3d3d 100%); color: #f9f8f6; padding: 40px 30px; border-radius: 4px 4px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 2px; }
              .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
              .content { background: white; padding: 40px 30px; border: 1px solid #e5dfd7; }
              .section { margin-bottom: 30px; }
              .section h2 { color: #1a1816; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 2px solid #d4a5a5; padding-bottom: 10px; }
              .booking-details { background: #f9f8f6; padding: 20px; border-radius: 4px; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5dfd7; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { font-weight: 600; color: #1a1816; }
              .detail-value { text-align: right; color: #666; }
              .price-section { background: #fdfbf9; padding: 20px; border-radius: 4px; margin-top: 15px; }
              .price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
              .price-row:last-child { margin-bottom: 0; border-top: 2px solid #e5dfd7; padding-top: 10px; }
              .total-price { font-size: 24px; color: #d4a5a5; font-weight: bold; }
              .confirmation-message { background: #e8f5e9; padding: 15px; border-radius: 4px; color: #2e7d32; border-left: 4px solid #2e7d32; margin-top: 20px; }
              .footer { background: #f9f8f6; padding: 20px; text-align: center; border-radius: 0 0 4px 4px; font-size: 12px; color: #888; }
              .cta { text-align: center; margin: 30px 0; }
              .cta a { display: inline-block; padding: 12px 30px; background: #1a1816; color: #f9f8f6; text-decoration: none; border-radius: 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>LUMINA</h1>
                <p>Салон красоты премиум-класса</p>
              </div>
              
              <div class="content">
                <p style="font-size: 16px; margin-top: 0;">
                  Спасибо, <strong>${customerName}</strong>! Ваша запись подтверждена.
                </p>

                <div class="section">
                  <h2>📋 Детали вашей записи</h2>
                  <div class="booking-details">
                    <div class="detail-row">
                      <span class="detail-label">Услуга:</span>
                      <span class="detail-value"><strong>${serviceName}</strong></span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Дата:</span>
                      <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Время:</span>
                      <span class="detail-value"><strong>${bookingTime}</strong></span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Продолжительность:</span>
                      <span class="detail-value">${serviceDuration}</span>
                    </div>
                  </div>

                  <div class="price-section">
                    <div class="price-row">
                      <span class="detail-label">Стоимость:</span>
                      <span class="total-price">€${servicePrice}</span>
                    </div>
                  </div>
                </div>

                ${notes ? `
                <div class="section">
                  <h2>💬 Ваши пожелания</h2>
                  <p style="background: #fdfbf9; padding: 15px; border-radius: 4px; margin: 0; color: #666;">
                    ${notes}
                  </p>
                </div>
                ` : ''}

                <div class="section">
                  <h2>📍 Салон находится в</h2>
                  <p style="margin: 0;">
                    <strong>LUMINA Beauty Salon</strong><br>
                    Франкфурт-на-Майне<br>
                    Altstadt, 42<br>
                    <br>
                    📞 +49 69 123 456<br>
                    🕐 Пн-Пт: 10:00-20:00 | Сб: 10:00-18:00
                  </p>
                </div>

                <div class="confirmation-message">
                  <strong>✓ Запись подтверждена!</strong><br>
                  Пожалуйста, приходите за 5-10 минут до назначенного времени.
                  Если вам нужно перенести запись, позвоните нам за 24 часа.
                </div>
              </div>

              <div class="footer">
                <p>LUMINA © 2024 | Салон красоты премиум-класса | Франкфурт-на-Майне</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    // Send notification email to salon manager
    const managerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'timfesc@gmail.com',
        subject: `Новая запись: ${serviceName} — ${customerName}`,
        html: `
          <!DOCTYPE html>
          <html lang="ru">
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px; }
              .header { background: #1a1816; color: white; padding: 20px; border-radius: 4px 4px 0 0; text-align: center; }
              .header h1 { margin: 0; }
              .content { background: white; padding: 20px; border: 1px solid #ddd; }
              .section { margin-bottom: 20px; }
              .section h2 { color: #333; margin-top: 0; border-bottom: 2px solid #d4a5a5; padding-bottom: 8px; }
              .row { display: flex; justify-content: space-between; padding: 8px 0; }
              .label { font-weight: bold; }
              .price { color: #d4a5a5; font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🆕 НОВАЯ ЗАПИСЬ</h1>
              </div>
              
              <div class="content">
                <div class="section">
                  <h2>📋 Детали записи</h2>
                  <div class="row">
                    <span class="label">Услуга:</span>
                    <span><strong>${serviceName}</strong></span>
                  </div>
                  <div class="row">
                    <span class="label">Дата:</span>
                    <span>${formattedDate}</span>
                  </div>
                  <div class="row">
                    <span class="label">Время:</span>
                    <span><strong>${bookingTime}</strong></span>
                  </div>
                  <div class="row">
                    <span class="label">Продолжительность:</span>
                    <span>${serviceDuration}</span>
                  </div>
                  <div class="row">
                    <span class="label">Цена:</span>
                    <span class="price">€${servicePrice}</span>
                  </div>
                </div>

                <div class="section">
                  <h2>👤 Информация о клиенте</h2>
                  <div class="row">
                    <span class="label">Имя:</span>
                    <span>${customerName}</span>
                  </div>
                  <div class="row">
                    <span class="label">Email:</span>
                    <span>${customerEmail}</span>
                  </div>
                  <div class="row">
                    <span class="label">Телефон:</span>
                    <span><a href="tel:${customerPhone.replace(/\s/g, '')}" style="color: #d4a5a5; text-decoration: none;">${customerPhone}</a></span>
                  </div>
                </div>

                ${notes ? `
                <div class="section">
                  <h2>💬 Пожелания</h2>
                  <p style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin: 0;">
                    ${notes}
                  </p>
                </div>
                ` : ''}

                <div class="section" style="border-top: 2px solid #e5dfd7; padding-top: 15px; color: #999; font-size: 12px;">
                  <strong>Время получения записи:</strong> ${bookingSubmissionTime}
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    if (!customerResponse.ok || !managerResponse.ok) {
      return res.status(500).json({ 
        message: 'Failed to send emails',
        error: customerResponse.statusText
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed and emails sent successfully'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}
