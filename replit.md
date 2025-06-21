# Arabic E-commerce Platform - سنتر المستودع للساعات والعطور

## Project Overview
A comprehensive Arabic e-commerce website for "سنتر المستودع للساعات والعطور" (Center Warehouse for Watches and Perfumes) featuring a modern professional interface for customers to shop watches and perfumes, plus a complete admin dashboard for store management.

## Recent Achievements (January 2025)
✅ **Complete Telegram Bot Integration**
- Automatic order notifications in Arabic sent to Telegram
- Admin configuration panel for bot token and chat ID
- Real-time test functionality to verify bot settings
- Error handling with detailed Arabic messages
- Integration with order creation workflow

✅ **Advanced Analytics & Visitor Tracking**
- Country-based visitor analytics with IP geolocation
- Real-time visitor statistics and daily counts
- Admin dashboard with visitor insights
- Activity logging for customer behavior

✅ **Dynamic Currency System**
- Custom USD exchange rate management (default: 1500 IQD per USD)
- Applied across all financial reports and displays
- Admin configurable through settings panel

✅ **Database Integrity & Product Management Fix (January 21, 2025)**
- Fixed product deletion foreign key constraint issues
- Implemented proper cascading deletion for related records
- Enhanced transaction handling for data integrity
- Added comprehensive error logging for debugging
- Product deletion now properly handles cart items and activity records

✅ **Database Cleanup for Production (January 21, 2025)**
- Removed all test customer data and orders
- Cleaned visitor statistics and activity logs
- Preserved admin account and store settings
- Database ready for real customer data entry

✅ **Dynamic Image Management System (January 21, 2025)**
- Added "صور الموقع" tab in admin settings
- All website images now manageable from admin panel
- Includes category images, customer testimonials, and default product image
- Dynamic integration with homepage and product pages
- Default values set with current Unsplash images

✅ **Complete Interface Separation & Enhanced Security (January 21, 2025)**
- Completely separated customer interface from admin panel
- Removed all admin access links/buttons from customer-facing pages
- Enhanced security by hiding admin functionality from regular users
- Admin access only available through direct URL: `/admin/login`
- Clean customer experience without administrative distractions

✅ **Fixed Account Creation Icon Visibility (January 21, 2025)**
- Account creation button now permanently disappears after first user registration
- Uses localStorage to maintain state across login/logout sessions
- Improved user experience by preventing confusion about account creation
- Fixed authentication flow to work seamlessly with login/logout cycles

✅ **Advanced Security Implementation (January 21, 2025)**
- Multi-layer security system with rate limiting and IP blocking
- Failed login attempt tracking (5 attempts = 15 min lockout)
- Advanced JWT token security with 8-hour expiration
- Input sanitization to prevent XSS and injection attacks
- Security headers (X-Frame-Options, CSP, XSS Protection)
- Suspicious activity detection and automatic blocking
- Enhanced admin authentication with extra rate limiting (3 attempts per 15 min)
- Comprehensive security event logging for monitoring

✅ **Enhanced Admin Login Interface (January 21, 2025)**
- Professional dual-panel login design with features showcase
- Left panel displays all system capabilities with visual icons
- Advanced features section highlighting Telegram, analytics, and security
- Modern gradient design with glassmorphic effects
- Real-time status indicators for all system features
- Enhanced user experience with animated loading states
- Mobile-responsive design maintaining professional appearance

✅ **Interactive Theme Gallery (January 21, 2025)**
- Complete theme gallery with 6 professional themes
- Real-time theme preview and instant application
- Themes include: Royal Blue, Emerald Luxury, Sunset Warmth, Midnight Elegance, Rose Gold, Nature Green
- Admin panel integration for easy theme management
- Dynamic color system updates across entire website

✅ **Complete Mobile Optimization (January 21, 2025)**
- Fixed floating cart button positioning and design for mobile devices
- Completely redesigned cart page with separate mobile and desktop layouts
- Smooth, gradient dividers replacing harsh borders throughout the site
- Enhanced mobile-friendly product cards with rounded corners
- Improved mobile checkout process with better form layouts
- Mobile-optimized buttons, inputs, and spacing
- Professional mobile cart button with gradient background and hover effects

## Current System Features

### Customer Features
- Bilingual Arabic/English product browsing
- Advanced cart system with session persistence
- Real-time order tracking
- Mobile-responsive design
- Visitor analytics tracking

### Admin Features
- Complete product and category management
- Order management with status updates
- Financial reporting with custom exchange rates
- Telegram Bot notifications for new orders
- Visitor analytics dashboard
- Store customization (colors, branding, policies)

## Technical Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based admin system
- **Integrations**: Telegram Bot API
- **Analytics**: Custom visitor tracking system

## Admin Access
- URL: `/admin/login`
- يجب إنشاء حساب جديد عند أول استخدام

## Telegram Bot Configuration
**Location**: Admin Settings → معلومات المتجر → إعدادات بوت Telegram

**Required Settings**:
1. **Bot Token**: Get from @BotFather on Telegram
2. **Chat ID**: Your Telegram user/group ID for notifications

**Features**:
- Automatic Arabic notifications for new orders
- Test functionality to verify configuration
- Order details include customer info, products, and totals

## Key Business Information
- **Store Name**: سنتر المستودع للساعات والعطور
- **Address**: الرمادي المستودع قرب مول الستي سنتر
- **Phones**: 07813961800, 07810125388
- **Specialties**: Watches (ساعات) and Perfumes (عطور)

## User Preferences
- Communication in Arabic for business context
- Focus on professional, modern design
- Emphasis on mobile responsiveness
- Real-time notifications and analytics priority

## Next Development Priorities
1. Enhanced product search and filtering
2. Customer wishlist functionality
3. Advanced inventory management
4. Multi-payment gateway integration