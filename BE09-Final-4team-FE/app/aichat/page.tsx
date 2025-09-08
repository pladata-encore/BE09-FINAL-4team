"use client";

import React, { useState } from "react";
import Chatbot from "./components/Chatbot";
import ChatbotSticker from "./components/ChatbotSticker";

export default function AIChatPage(): JSX.Element {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const toggleChat = (): void => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="relative">
      {/* 챗봇 스티커 - 항상 표시 */}
      <ChatbotSticker isOpen={isChatOpen} onToggle={toggleChat} />

      {/* 챗봇 창 - 열렸을 때만 표시 */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Chatbot onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
