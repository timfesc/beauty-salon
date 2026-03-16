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

    // Send notification email to salon manager only
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
              .content { background: white; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 4px 4px; }
              .section { margin-bottom: 20px; }
              .section h2 { color: #333; margin-top: 0; border-bottom: 2px solid #d4a5a5; padding-bottom: 8px; }
              .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
              .row:last-child { border-bottom: none; }
              .label { font-weight: bold; color: #555; }
              .price { color: #d4a5a5; font-weight: bold; font-size: 20px; }
              .notes-box { background: #f9f9f9; padding: 12px; border-radius: 4px; color: #666; }
              .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🆕 НОВАЯ ЗАПИСЬ — LUMINA</h1>
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
                  <h2>👤 Клиент</h2>
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
                  <h2>💬 Пожелания клиента</h2>
                  <div class="notes-box">${notes}</div>
                </div>
                ` : ''}

                <div class="footer">
                  Запись получена: ${bookingSubmissionTime}
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const managerResult = await managerResponse.json();

    if (!managerResponse.ok) {
      console.error('Resend error:', managerResult);
      return res.status(500).json({ 
        message: 'Failed to send email',
        error: managerResult
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking confirmed and email sent to manager'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}
