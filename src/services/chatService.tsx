import axios from "axios";
import { ChatMessage } from "../types";

// const BASE_URL = "http://localhost:8080/api/chat";
const BASE_URL = import.meta.env.VITE_API_URL;

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  participants: string[]
): Promise<void> => {
  const token = sessionStorage.getItem("idToken") || "";

  await axios.post(
    `${BASE_URL}/api/send`,
    { chatId, senderId, text, participants },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const token = sessionStorage.getItem("idToken") || "";

  const res = await axios.get(`${BASE_URL}/api/chat/${chatId}/messages?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data as ChatMessage[];
};
