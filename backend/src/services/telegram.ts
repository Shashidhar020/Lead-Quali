export const sendTelegramNotification = async (
  name: string,
  phone: string,
  businessType: string,
  leadScore: number,
  summary: string
): Promise<boolean> => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const messageText = `
<b>⚡ NEW LEAD RECEIVED</b>

<b>Name:</b> ${name}
<b>Phone:</b> ${phone}
<b>Business Type:</b> ${businessType}
<b>Lead Score:</b> ${leadScore}%
<b>Summary:</b> ${summary}
  `.trim();

  if (!token || !chatId) {
    console.log('\n=========================================');
    console.log('[TELEGRAM MOCK] notification event:');
    console.log(messageText.replace(/<[^>]*>/g, '')); // Stripping HTML tags for clean console display
    console.log('=========================================\n');
    return true;
  }

  console.log('[TELEGRAM SERVICE] Dispatching live alert notification...');

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TELEGRAM SERVICE] Telegram API responded with status ${response.status}: ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[TELEGRAM SERVICE] Connection failed, could not dispatch alert:', error);
    return false;
  }
};
