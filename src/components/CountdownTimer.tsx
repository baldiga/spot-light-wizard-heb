
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  remainingTime: number; // in milliseconds
  onExpire?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ remainingTime, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          onExpire?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return null;
  }

  return (
    <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <p className="text-orange-800 font-medium mb-2">
        ניתן לשלוח קוד אימות חדש בעוד:
      </p>
      <div className="text-2xl font-bold text-orange-600">
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default CountdownTimer;
