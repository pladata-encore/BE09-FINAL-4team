import React from "react";
import { createChatBotMessage, createClientMessage } from "react-chatbot-kit";

// Type definitions
interface ChatBotMessage {
  id: number;
  message: string;
  type: "bot" | "user";
  [key: string]: any;
}

interface State {
  messages: ChatBotMessage[];
  [key: string]: any;
}

interface ActionProviderConstructor {
  createChatBotMessage: (message: string, options?: any) => ChatBotMessage;
  setState: (updater: (prevState: State) => State) => void;
  createClientMessage: (message: string, options?: any) => ChatBotMessage;
  stateRef: React.MutableRefObject<State>;
  createCustomMessage: (message: string, options?: any) => ChatBotMessage;
}

class ActionProvider {
  private createChatBotMessage: (
    message: string,
    options?: any
  ) => ChatBotMessage;
  private setState: (updater: (prevState: State) => State) => void;
  private createClientMessage: (
    message: string,
    options?: any
  ) => ChatBotMessage;
  private stateRef: React.MutableRefObject<State>;
  private createCustomMessage: (
    message: string,
    options?: any
  ) => ChatBotMessage;

  constructor(
    createChatBotMessage: (message: string, options?: any) => ChatBotMessage,
    setState: (updater: (prevState: State) => State) => void,
    createClientMessage: (message: string, options?: any) => ChatBotMessage,
    stateRef: React.MutableRefObject<State>,
    createCustomMessage: (message: string, options?: any) => ChatBotMessage
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }

  // Generic reply from backend
  reply = (text: string): void => {
    const message = this.createChatBotMessage(text);
    this.addMessageToState(message);
  };

  // Handle backend-issued command
  handleCommand = (command: {
    type: string;
    params?: Record<string, any>;
  }): void => {
    const type = (command?.type || "").toUpperCase();
    const params = command?.params || {};

    switch (type) {
      case "NAVIGATE": {
        const path = params.path as string;
        if (path && typeof window !== "undefined") {
          window.location.href = path;
        } else {
          this.reply("이동할 경로가 필요해요. 다시 요청해 주세요.");
        }
        break;
      }
      case "FILL_VACATION_FORM": {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "aichat:vacationDraft",
              JSON.stringify(params)
            );
            this.reply(
              "휴가 신청서 초안을 작성했어요. 확인 페이지로 이동할게요."
            );
            window.location.href = "/vacation";
          } catch {
            this.reply("초안 저장 중 문제가 발생했어요. 다시 시도해 주세요.");
          }
        }
        break;
      }
      case "SUBMIT_VACATION_FORM": {
        // 서버 측 제출 플로우로 전환하는 것이 바람직하지만, 여기서는 안내만 합니다.
        this.reply(
          "휴가 신청서 제출을 진행할게요. 화면에서 최종 확인해 주세요."
        );
        break;
      }
      case "OPEN_APPROVAL": {
        const approvalId = params.approvalId;
        if (approvalId && typeof window !== "undefined") {
          window.location.href = `/approvals/${approvalId}`;
        } else {
          this.reply("열 수 있는 결재 문서가 없어요. 번호를 알려주세요.");
        }
        break;
      }
      default:
        this.reply("지원하지 않는 명령이에요. 다시 요청해 주세요.");
    }
  };

  // Deprecated hardcoded helpers (kept for compatibility; no longer used)
  greet = (): void => {
    const message = this.createChatBotMessage(
      "안녕하세요! 저는 업무를 도와드리는 AI 어시스턴트입니다. 무엇을 도와드릴까요?"
    );
    this.addMessageToState(message);
  };

  handleUnknown = (): void => {
    const message = this.createChatBotMessage(
      "죄송합니다. 이해하지 못했어요. 다시 질문해 주세요."
    );
    this.addMessageToState(message);
  };

  addMessageToState = (message: ChatBotMessage): void => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

export default ActionProvider;
