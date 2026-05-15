import ChatContainer from "./components/ChatContainer";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { HumanBubble, AIBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
import { useStream } from "@langchain/react";
import RenderToolCalls from "./components/ToolCallRender";
import { useChatContext } from "./instance/context";
import { useAuth } from "../Auth";
import { useCallback, useState } from "react";
import { blobURLtoBase64 } from "./utils/imageUtils";

type ChatSessionProps = {
  onNewChat: () => void;
};

function ChatSession({ onNewChat }: ChatSessionProps) {
  const { user } = useAuth();
  const threadId = useChatContext((s) => s.theadId);
  const createThread = useChatContext((state) => state.createdThread);
  const setThreadId = useChatContext((s) => s.setThreadId);

  console.log("Current thread id", threadId)

  const getToken = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");
    return user.getIdToken();
  }, [user]);

  const stream = useStream({
    threadId: threadId || undefined,
    apiUrl: "http://127.0.0.1:2024",
    assistantId: "agent_gestalt",
    onThreadId: async (id: string) => {
      if (!user) return;

      const token = await getToken();
      const created = await createThread(token, id);
      setThreadId(created.id);
    },
  });

  const handleSubmit = async (
    text: string,
    images?: string[] | null | undefined,
  ) => {
    type ContentItem =
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } };

    const content: ContentItem[] = [{ type: "text", text }];

    if (images && images.length > 0) {
      const b64 = await blobURLtoBase64(images[0]);
      content.push({
        type: "image_url",
        image_url: { url: b64 },
      });
    }

    stream.submit({
      messages: [
        {
          role: "human",
          content,
        },
      ],
    });
  };

  return (
    <ChatContainer
      size="lg"
      onNewChat={onNewChat}
      input={
        <ChatInput
          handleSubmit={handleSubmit}
          disabled={stream.isLoading}
          multiModal={true}
        />
      }
    >
      {stream.messages.map((msg) => {
        if (msg.type === "human") {
          return <HumanBubble key={msg.id} msg={msg as HumanMessage} />;
        }
        if (msg.type === "ai") {
          return <AIBubble key={msg.id} msg={msg as AIMessage}></AIBubble>;
        }
        if (msg.type === "tool") {
          return <RenderToolCalls key={msg.id} msg={msg} />;
        }

        return null;
      })}
    </ChatContainer>
  );
}

export default function Chat() {
  const setThreadId = useChatContext((s) => s.setThreadId);
  const [sessionKey, setSessionKey] = useState(0);

  const handleNewChat = () => {
    setThreadId(null);
    setSessionKey((k) => k + 1);
  };

  return <ChatSession key={sessionKey} onNewChat={handleNewChat} />;
}
