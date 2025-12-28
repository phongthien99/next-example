"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  isPaused: boolean;
  onTimeUpdate?: (formattedTime: string, seconds: number) => void;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export function Timer({ isPaused, onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep the ref current
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPaused]);

  // Call onTimeUpdate when seconds change (separate from state update)
  useEffect(() => {
    if (onTimeUpdateRef.current && seconds > 0) {
      onTimeUpdateRef.current(formatTime(seconds), seconds);
    }
  }, [seconds]);

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="font-mono text-lg text-gray-700">
        {formatTime(seconds)}
      </span>
      {isPaused && (
        <span className="text-xs text-orange-600 font-semibold">PAUSED</span>
      )}
    </div>
  );
}
