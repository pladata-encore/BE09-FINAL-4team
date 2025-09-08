"use client";

import React, { useState } from "react";
import ChatbotKit from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import "./chatbot-styles.css";
import { Button } from "@/components/ui/button";
import { X, Send, Bot, User, Maximize2, Minimize2, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

// Type definitions
interface ChatbotProps {
  onClose: () => void;
}

export default function Chatbot({ onClose }: ChatbotProps): JSX.Element {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleMinimize = (): void => {
    setIsMinimized(!isMinimized);
    if (isExpanded) setIsExpanded(false);
  };

  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
    if (isMinimized) setIsMinimized(false);
  };

  // 메시지 컨테이너에 자동 스크롤 기능 추가
  React.useEffect(() => {
    const messageContainer = document.querySelector(
      ".react-chatbot-kit-chat-message-container"
    );
    if (messageContainer) {
      // 초기 스크롤을 맨 아래로 (추가 여백 포함)
      const scrollToBottom = (): void => {
        messageContainer.scrollTop = messageContainer.scrollHeight + 50;
      };

      scrollToBottom();

      // 새로운 메시지가 추가될 때마다 스크롤을 맨 아래로
      const observer = new MutationObserver(() => {
        setTimeout(scrollToBottom, 100); // 약간의 지연을 두어 DOM 업데이트 완료 후 스크롤
      });

      observer.observe(messageContainer, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  // 채팅창 크기 설정
  const getChatbotSize = (): string => {
    if (isMinimized) return "w-80";
    if (isExpanded) return "w-96 h-[600px]";
    return "w-80 h-[500px]";
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI 어시스턴트</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleMinimize}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                title="최대화"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 최소화된 상태 메시지 */}
          <div className="p-4 text-center text-gray-600">
            <p className="text-sm">챗봇이 최소화되었습니다</p>
            <Button
              onClick={toggleMinimize}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              다시 열기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
          getChatbotSize()
        )}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">AI 어시스턴트</span>
          </div>
          <div className="flex items-center gap-1">
            {/* 크기 조절 버튼 */}
            <Button
              onClick={toggleExpand}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              title={isExpanded ? "크기 줄이기" : "크기 늘리기"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            {/* 최소화 버튼 */}
            <Button
              onClick={toggleMinimize}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              title="최소화"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 9l7 7 7-7"
                />
              </svg>
            </Button>
            {/* 닫기 버튼 */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              title="닫기"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 챗봇 컨텐츠 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            <ChatbotKit
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
