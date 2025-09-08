import React from "react";
import { createChatBotMessage } from "react-chatbot-kit";
import apiClient from "@/lib/services/common/api-client";

// Type definitions
interface ActionProvider {
  reply: (text: string) => void;
  handleCommand: (command: {
    type: string;
    params?: Record<string, any>;
  }) => void;
  handleUnknown: () => void;
}

interface State {
  [key: string]: any;
}

class MessageParser {
  private actionProvider: ActionProvider;
  private state: State;

  constructor(actionProvider: ActionProvider, state: State) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse = async (message: string): Promise<void> => {
    try {
      const payload = {
        messages: [
          { role: "system", content: "당신은 업무 도우미입니다." },
          { role: "user", content: message },
        ],
        allowCommands: true,
      };

      const res = await apiClient.post("/api/aichat/chat", payload);
      const data = res.data?.data;

      if (!data || !data.type) {
        this.actionProvider.handleUnknown();
        return;
      }

      if (data.type === "reply") {
        this.actionProvider.reply(data.reply || "");
      } else if (data.type === "command") {
        this.actionProvider.handleCommand(data.command || {});
      } else {
        this.actionProvider.handleUnknown();
      }
    } catch (e: any) {
      this.actionProvider.reply(
        e?.message || "서버와 통신 중 오류가 발생했어요."
      );
    }
  };
}

export default MessageParser;
