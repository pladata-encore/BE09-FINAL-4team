"use client";

import React, { useState } from "react";
import Chatbot from "../aichat/components/Chatbot";
import ChatbotSticker from "../aichat/components/ChatbotSticker";

export default function TestChatbotPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          AI 챗봇 테스트
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            테스트 방법
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>• 오른쪽 하단의 로봇 아이콘을 클릭하여 챗봇을 열어보세요</li>
            <li>• 다음과 같은 키워드로 테스트해보세요:</li>
            <li className="ml-4">- "안녕" 또는 "hello"</li>
            <li className="ml-4">- "도움" 또는 "help"</li>
            <li className="ml-4">- "날씨" 또는 "weather"</li>
            <li className="ml-4">- "시간" 또는 "time"</li>
            <li className="ml-4">
              - "일정", "직원", "문서", "휴가", "승인", "설정"
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            챗봇 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📅 일정 관리</h3>
              <p className="text-blue-600 text-sm">
                캘린더 확인, 일정 등록, 수정
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                👥 직원 관리
              </h3>
              <p className="text-green-600 text-sm">
                직원 목록, 정보 조회, 등록
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">
                📄 문서 관리
              </h3>
              <p className="text-purple-600 text-sm">문서 업로드, 검색, 공유</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">
                🏖️ 휴가 관리
              </h3>
              <p className="text-orange-600 text-sm">
                휴가 신청, 승인 상태 확인
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">
                ✅ 승인 프로세스
              </h3>
              <p className="text-red-600 text-sm">승인 처리, 이력 조회</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                ⚙️ 시스템 설정
              </h3>
              <p className="text-gray-600 text-sm">회사 정보, 근무 정책 설정</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 챗봇 스티커 - 항상 표시 */}
      <ChatbotSticker isOpen={isChatOpen} onToggle={toggleChat} />

      {/* AI 챗봇 창 - 열렸을 때만 표시 */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Chatbot onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
