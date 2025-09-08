"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TimePickerProps {
  time: string[];
  handleTimeScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  type: "hour" | "minute";
}

const TimePicker = ({
  time,
  handleTimeScroll,
  selectedTime,
  onTimeChange,
  type,
}: TimePickerProps) => {
  const [inputValue, setInputValue] = useState(selectedTime);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(selectedTime);
  }, [selectedTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue);
    const maxValue = type === "hour" ? 23 : 59;

    if (isNaN(numValue) || numValue < 0) {
      setInputValue("00");
      onTimeChange("00");
    } else if (numValue > maxValue) {
      const formattedValue = maxValue.toString().padStart(2, "0");
      setInputValue(formattedValue);
      onTimeChange(formattedValue);
    } else {
      const formattedValue = numValue.toString().padStart(2, "0");
      setInputValue(formattedValue);
      onTimeChange(formattedValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  const handleInputClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const increment = () => {
    const currentIndex = time.indexOf(selectedTime);
    const nextIndex = (currentIndex + 1) % time.length;
    const nextValue = time[nextIndex];
    onTimeChange(nextValue);
  };

  const decrement = () => {
    const currentIndex = time.indexOf(selectedTime);
    const prevIndex = currentIndex === 0 ? time.length - 1 : currentIndex - 1;
    const prevValue = time[prevIndex];
    onTimeChange(prevValue);
  };

  return (
    <div className="flex flex-col items-center">
      {/* 위쪽 화살표 */}
      <button
        onClick={increment}
        className="w-8 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-t-md transition-colors cursor-pointer"
      >
        <ChevronUp className="w-4 h-4 text-blue-500" />
      </button>

      {/* 숫자 입력 필드 */}
      <div className="w-16 h-10 bg-gray-100 border-x border-gray-200 flex items-center justify-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-full h-full text-center bg-transparent border-none outline-none text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={0}
            max={type === "hour" ? 23 : 59}
            autoFocus
          />
        ) : (
          <span
            onClick={handleInputClick}
            className="w-full h-full flex items-center justify-center text-lg font-medium text-gray-800 cursor-pointer select-none"
          >
            {selectedTime}
          </span>
        )}
      </div>

      {/* 아래쪽 화살표 */}
      <button
        onClick={decrement}
        className="w-8 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-b-md transition-colors cursor-pointer"
      >
        <ChevronDown className="w-4 h-4 text-blue-500" />
      </button>
    </div>
  );
};

export default TimePicker;
