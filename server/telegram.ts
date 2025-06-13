import type { Order } from "@shared/schema";

interface TelegramMessage {
  orderId: number;
  customerName: string;
  customerPhone: string;
  totalAmount: string;
  items: Array<{
    name: string;
    nameAr: string;
    quantity: number;
    price: string;
  }>;
}

export class TelegramService {
  private botToken: string;
  private chatId: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
  }

  private formatOrderMessage(order: TelegramMessage): string {
    const itemsList = order.items.map(item => 
      `• ${item.nameAr} (${item.name})\n  الكمية: ${item.quantity} - السعر: ${item.price} د.ع`
    ).join('\n');

    return `🔔 *طلب جديد في المتجر*

📋 *رقم الطلب:* ${order.orderId}
👤 *اسم العميل:* ${order.customerName}
📱 *رقم الهاتف:* ${order.customerPhone}
💰 *المبلغ الإجمالي:* ${order.totalAmount} د.ع

📦 *المنتجات المطلوبة:*
${itemsList}

---
سنتر المستودع للساعات والعطور
الرمادي - قرب مول الستي سنتر`;
  }

  async sendOrderNotification(order: TelegramMessage): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.log('Telegram bot credentials not configured');
      return false;
    }

    try {
      const message = this.formatOrderMessage(order);
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('Telegram notification sent successfully');
        return true;
      } else {
        console.error('Failed to send Telegram notification:', result);
        return false;
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.botToken) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getMe`;
      const response = await fetch(url);
      const result = await response.json();
      
      return result.ok;
    } catch (error) {
      console.error('Error testing Telegram connection:', error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();