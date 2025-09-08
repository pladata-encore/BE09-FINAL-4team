"use client";

import { useState } from "react";
import Chatbot from "./components/Chatbot";
import ChatbotSticker from "./components/ChatbotSticker";

export default function GlobalAIChat(): JSX.Element {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  return (
    <div>
      <ChatbotSticker
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((v) => !v)}
      />
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Chatbot onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
}
