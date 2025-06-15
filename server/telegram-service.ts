import TelegramBot from 'node-telegram-bot-api';
import type { Order } from '@shared/schema';
import { storage } from './storage';

class TelegramService {
  private bot: TelegramBot | null = null;
  private chatId: string | null = null;

  constructor() {
    // Initialize from database settings when needed
  }

  private async initializeBot() {
    try {
      // Get settings from database
      const botTokenSetting = await storage.getStoreSetting('telegram_bot_token');
      const chatIdSetting = await storage.getStoreSetting('telegram_chat_id');

      const token = botTokenSetting?.value;
      const chatId = chatIdSetting?.value;

      console.log('Telegram settings check:', {
        tokenExists: !!token,
        chatIdExists: !!chatId,
        tokenLength: token?.length || 0
      });

      if (!token || !chatId) {
        throw new Error('إعدادات البوت غير مكتملة - يجب إدخال رمز البوت ومعرف المحادثة');
      }

      if (!token.includes(':')) {
        throw new Error('رمز البوت غير صحيح - يجب أن يحتوي على : في الوسط');
      }

      this.bot = new TelegramBot(token, { polling: false });
      this.chatId = chatId;
      console.log('Telegram bot initialized successfully from database settings');
      return true;
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
      throw error;
    }
  }

  async sendOrderNotification(order: Order) {
    // Initialize bot if not already done
    if (!this.bot || !this.chatId) {
      const initialized = await this.initializeBot();
      if (!initialized) {
        console.log('Telegram bot not configured - skipping notification');
        return;
      }
    }

    try {
      const message = this.formatOrderMessage(order);
      await this.bot!.sendMessage(this.chatId!, message, { parse_mode: 'HTML' });
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
    // Initialize bot with fresh settings
    const initialized = await this.initializeBot();
    if (!initialized) {
      throw new Error('Telegram bot not configured - missing bot token or chat ID');
    }

    try {
      await this.bot!.sendMessage(this.chatId!, 
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