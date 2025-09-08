"use client";
import { useState } from "react";
import TimePicker from "./TimePicker";

interface SelectTimeProps {
  onTimeSelect: (time: string) => void;
  onClose: () => void;
  isDropdown?: boolean;
}

const SelectTime = ({
  onTimeSelect,
  onClose,
  isDropdown = false,
}: SelectTimeProps) => {
  const [selectedHour, setSelectedHour] = useState("17");
  const [selectedMinute, setSelectedMinute] = useState("30");

  // 시간,분 데이터 만들기(인덱스 활용)
  // 인덱스를 문자열로 변환하고 문자열 길이 2자리로 만들기(앞에 "0"채움)
  const hours = [...Array(24)].map((_, i) => i.toString().padStart(2, "0"));
  const minutes = [...Array(60)].map((_, i) => i.toString().padStart(2, "0"));

  // 시간,분 변경 핸들러
  const handleHourChange = (hour: string) => {
    setSelectedHour(hour);
  };

  const handleMinuteChange = (minute: string) => {
    setSelectedMinute(minute);
  };

  // 확인버튼 + 드롭다운닫기
  const handleConfirm = () => {
    onTimeSelect(`${selectedHour}:${selectedMinute}`); // 선택된 시간을 "17:30" 형식으로 전달
    onClose();
  };

  if (isDropdown) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg shadow-lg p-4">
        {/* 시간 선택 영역 */}
        <div className="flex justify-center items-center gap-1 mb-4">
          {/* 시간 선택 */}
          <TimePicker
            time={hours}
            handleTimeScroll={() => {}}
            selectedTime={selectedHour}
            onTimeChange={handleHourChange}
            type="hour"
          />
          <span className="text-2xl font-bold text-gray-400 mx-1">:</span>
          {/* 분 선택 */}
          <TimePicker
            time={minutes}
            handleTimeScroll={() => {}}
            selectedTime={selectedMinute}
            onTimeChange={handleMinuteChange}
            type="minute"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 text-gray-600 font-medium bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 px-3 text-white font-medium bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-sm"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg shadow-lg p-6 min-w-[280px]">
      {/* 시간 선택 영역 */}
      <div className="flex justify-center items-center gap-1 mb-6">
        {/* 시간 선택 */}
        <TimePicker
          time={hours}
          handleTimeScroll={() => {}}
          selectedTime={selectedHour}
          onTimeChange={handleHourChange}
          type="hour"
        />
        <span className="text-2xl font-bold text-gray-400 mx-1">:</span>
        {/* 분 선택 */}
        <TimePicker
          time={minutes}
          handleTimeScroll={() => {}}
          selectedTime={selectedMinute}
          onTimeChange={handleMinuteChange}
          type="minute"
        />
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2 px-3 text-gray-600 font-medium bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-2 px-3 text-white font-medium bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-sm"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SelectTime;
