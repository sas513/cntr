import TelegramBot from 'node-telegram-bot-api';
import type { Order } from '@shared/schema';

class TelegramService {
  private bot: TelegramBot | null = null;
  private chatId: string | null = null;

  constructor() {
    this.initializeBot();
  }

  private initializeBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log('Telegram bot not configured - missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: false });
      this.chatId = chatId;
      console.log('Telegram bot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
    }
  }

  async sendOrderNotification(order: Order) {
    if (!this.bot || !this.chatId) {
      console.log('Telegram bot not configured - skipping notification');
      return;
    }

    try {
      const message = this.formatOrderMessage(order);
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'HTML' });
      console.log(`Order notification sent to Telegram for order #${order.id}`);
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }

  private formatOrderMessage(order: Order): string {
    const orderDate = new Date(order.createdAt || new Date()).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let itemsList = '';
    if (Array.isArray(order.items)) {
      itemsList = order.items.map(item => 
        `• ${item.nameAr || item.name} - الكمية: ${item.quantity} - السعر: ${item.price} د.ع`
      ).join('\n');
    }

    return `
🔔 <b>طلب جديد - سنتر المستودع للساعات والعطور</b>

📋 <b>رقم الطلب:</b> #${order.id}
👤 <b>اسم العميل:</b> ${order.customerName}
📱 <b>رقم الهاتف:</b> ${order.customerPhone}
${order.customerEmail ? `📧 <b>البريد الإلكتروني:</b> ${order.customerEmail}\n` : ''}
📍 <b>عنوان التوصيل:</b> ${order.shippingAddress}
🏙️ <b>المدينة:</b> ${order.city}

📦 <b>المنتجات:</b>
${itemsList}

💰 <b>إجمالي المبلغ:</b> ${order.totalAmount} د.ع
📅 <b>تاريخ الطلب:</b> ${orderDate}
📊 <b>حالة الطلب:</b> ${order.status === 'pending' ? 'في الانتظار' : order.status}

⚡ يرجى معالجة هذا الطلب في أقرب وقت ممكن.
`.trim();
  }

  async sendTestMessage() {
    if (!this.bot || !this.chatId) {
      throw new Error('Telegram bot not configured');
    }

    try {
      await this.bot.sendMessage(this.chatId, 
        '✅ تم تفعيل بوت إشعارات سنتر المستودع للساعات والعطور بنجاح!'
      );
      return true;
    } catch (error) {
      console.error('Failed to send test message:', error);
      throw error;
    }
  }
}

export const telegramService = new TelegramService();