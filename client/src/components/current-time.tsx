import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export default function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-IQ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-IQ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('ar-IQ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-full shadow-lg">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary arabic-text leading-tight">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-muted-foreground arabic-text mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatShortDate(currentTime)}
          </div>
        </div>
      </div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </div>
  );
}