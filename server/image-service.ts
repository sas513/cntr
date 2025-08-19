import { Request, Response } from 'express';

const watchesSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="watchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1B365D;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#2C5A8D;stop-opacity:0.8" />
    </linearGradient>
    <radialGradient id="watchFace" cx="50%" cy="50%" r="40%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="url(#watchGrad)"/>
  
  <!-- Watch Body -->
  <circle cx="400" cy="300" r="120" fill="#2c3e50" stroke="#34495e" stroke-width="8"/>
  <circle cx="400" cy="300" r="100" fill="url(#watchFace)" stroke="#bdc3c7" stroke-width="2"/>
  
  <!-- Hour markers -->
  <g stroke="#2c3e50" stroke-width="3">
    <line x1="400" y1="210" x2="400" y2="225" />
    <line x1="490" y1="300" x2="475" y2="300" />
    <line x1="400" y1="390" x2="400" y2="375" />
    <line x1="310" y1="300" x2="325" y2="300" />
  </g>
  
  <!-- Watch hands -->
  <line x1="400" y1="300" x2="400" y2="240" stroke="#2c3e50" stroke-width="4" stroke-linecap="round"/>
  <line x1="400" y1="300" x2="450" y2="300" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Center dot -->
  <circle cx="400" cy="300" r="8" fill="#2c3e50"/>
  
  <!-- Watch strap -->
  <rect x="380" y="180" width="40" height="20" fill="#8b4513" rx="5"/>
  <rect x="380" y="400" width="40" height="20" fill="#8b4513" rx="5"/>
  
  <!-- Luxury elements -->
  <circle cx="350" cy="250" r="15" fill="#ffd700" opacity="0.7"/>
  <circle cx="450" cy="350" r="12" fill="#ffd700" opacity="0.6"/>
  
  <text x="400" y="550" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="28" font-weight="bold">الساعات الفاخرة</text>
</svg>`;

const perfumesSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="perfumeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8E44AD;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#C39BD3;stop-opacity:0.8" />
    </linearGradient>
    <radialGradient id="bottleShine" cx="30%" cy="30%" r="60%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="url(#perfumeGrad)"/>
  
  <!-- Perfume Bottle -->
  <rect x="350" y="200" width="100" height="200" fill="#E8F4FD" stroke="#5DADE2" stroke-width="3" rx="10"/>
  <rect x="350" y="200" width="100" height="200" fill="url(#bottleShine)" rx="10"/>
  
  <!-- Bottle Cap -->
  <rect x="370" y="180" width="60" height="30" fill="#F39C12" stroke="#E67E22" stroke-width="2" rx="5"/>
  <rect x="380" y="170" width="40" height="15" fill="#F39C12" rx="3"/>
  
  <!-- Spray mechanism -->
  <rect x="390" y="160" width="20" height="12" fill="#BDC3C7" rx="2"/>
  <line x1="400" y1="160" x2="400" y2="145" stroke="#7F8C8D" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Liquid inside -->
  <rect x="360" y="220" width="80" height="160" fill="#E8F4FD" opacity="0.7" rx="5"/>
  <rect x="360" y="300" width="80" height="80" fill="#AED6F1" opacity="0.8" rx="5"/>
  
  <!-- Label -->
  <rect x="365" y="280" width="70" height="40" fill="#ffffff" opacity="0.9" rx="3"/>
  <text x="400" y="300" text-anchor="middle" fill="#2C3E50" font-family="Arial" font-size="12" font-weight="bold">عطر فاخر</text>
  
  <!-- Decorative elements -->
  <circle cx="320" cy="250" r="20" fill="#F1C40F" opacity="0.6"/>
  <circle cx="480" cy="320" r="15" fill="#E74C3C" opacity="0.5"/>
  <circle cx="300" cy="380" r="18" fill="#3498DB" opacity="0.4"/>
  
  <text x="400" y="550" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="28" font-weight="bold">العطور الأصلية</text>
</svg>`;

const heroBackgroundSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1B365D;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2C5A8D;stop-opacity:0.95" />
      <stop offset="100%" style="stop-color:#34495E;stop-opacity:0.9" />
    </linearGradient>
    <pattern id="luxury-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="30" cy="30" r="2" fill="#FFD700" opacity="0.1"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="800" fill="url(#heroGrad)"/>
  <rect width="1200" height="800" fill="url(#luxury-pattern)"/>
  
  <!-- Geometric luxury elements -->
  <polygon points="100,100 150,150 100,200 50,150" fill="#FFD700" opacity="0.2"/>
  <polygon points="1100,150 1150,200 1100,250 1050,200" fill="#FFD700" opacity="0.15"/>
  
  <!-- Watch silhouette -->
  <g transform="translate(150,250)">
    <circle cx="0" cy="0" r="80" fill="#34495E" opacity="0.3"/>
    <circle cx="0" cy="0" r="60" fill="#5D6D7E" opacity="0.4"/>
    <rect x="-20" y="-100" width="40" height="25" fill="#8B4513" opacity="0.3" rx="5"/>
    <rect x="-20" y="75" width="40" height="25" fill="#8B4513" opacity="0.3" rx="5"/>
  </g>
  
  <!-- Perfume bottle silhouette -->
  <g transform="translate(1000,300)">
    <rect x="-25" y="-50" width="50" height="100" fill="#8E44AD" opacity="0.3" rx="8"/>
    <rect x="-15" y="-65" width="30" height="18" fill="#F39C12" opacity="0.4" rx="3"/>
  </g>
  
  <!-- Decorative lines -->
  <line x1="0" y1="400" x2="400" y2="400" stroke="#FFD700" stroke-width="2" opacity="0.3"/>
  <line x1="800" y1="400" x2="1200" y2="400" stroke="#FFD700" stroke-width="2" opacity="0.3"/>
</svg>`;

export function serveWatchesImage(req: Request, res: Response) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(watchesSVG);
}

export function servePerfumesImage(req: Request, res: Response) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(perfumesSVG);
}

export function serveHeroBackground(req: Request, res: Response) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(heroBackgroundSVG);
}