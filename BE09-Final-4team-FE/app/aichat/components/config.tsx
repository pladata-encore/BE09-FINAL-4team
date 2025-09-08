import React from "react";

// Type definitions
interface InitialMessage {
  id: number;
  message: string;
  type: "bot" | "user";
}

interface CustomStyles {
  botMessageBox: {
    backgroundColor: string;
    color: string;
  };
  chatButton: {
    backgroundColor: string;
  };
}

interface ConfigState {
  gist: string;
  infoBox: string;
}

interface Config {
  initialMessages: InitialMessage[];
  botName: string;
  customStyles: CustomStyles;
  customComponents: Record<string, any>;
  state: ConfigState;
  widgets: any[];
}

const config: Config = {
  initialMessages: [
    {
      id: 1,
      message: "안녕하세요! AI 어시스턴트입니다. 무엇을 도와드릴까요?",
      type: "bot",
    },
  ],
  botName: "AI 어시스턴트",
  customStyles: {
    botMessageBox: {
      backgroundColor: "#3B82F6",
      color: "white",
    },
    chatButton: {
      backgroundColor: "#3B82F6",
    },
  },
  customComponents: {},
  state: {
    gist: "",
    infoBox: "",
  },
  widgets: [],
};

export default config;
