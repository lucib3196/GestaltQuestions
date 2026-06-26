import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { useStream } from "@langchain/react";
import { MathJax } from "better-react-mathjax";

import { aiURL } from "../../config/apiConfig";
import { useAuth } from "../Auth";
import { AIBubble, HumanBubble } from "./components/ChatBubble";
import ChatContainer from "./components/ChatContainer";
import { ChatInput } from "./components/ChatInput";
import RenderToolCalls from "./components/ToolCallRender";
import { useThreadStore } from "./instance/store";
import { prepareMessage } from "./utils";
import { useChatStore } from "./instance/store";

export function ChatSession() {
  const { user } = useAuth();
  const createThread = useThreadStore((state) => state.createThread);
  const threadId = useThreadStore((s) => s.threadId);

  const assistantId = useChatStore((s) => s.assistantId)
  const model = useChatStore((s) => s.model)

  const stream = useStream({
    threadId: threadId || null,
    apiUrl: aiURL,
    assistantId: assistantId,
    apiKey: import.meta.env.VITE_LANGSMITH_API_KEY,
    onThreadId: async (id: string) => {
      await createThread(id, await user?.getIdToken());
    },
  });

  const handleSubmit = async (text: string, images?: string[]) => {
    const content = await prepareMessage(text, images);
    stream.submit({
      messages: [
        {
          role: "human",
          content,
        },
      ],
    }, {
      context: {
        model: model
      }
    });
  };

  return (
    <ChatContainer
      size="lg"
      scrollTrigger={stream.messages.length}
      input={
        <ChatInput
          handleSubmit={handleSubmit}
          disabled={stream.isLoading}
          multiModal={true}
        />
      }
    >
      <MathJax dynamic>
        {stream.messages.map((msg) => {
          if (msg.type === "human") {
            return <HumanBubble key={msg.id} msg={msg as HumanMessage} />;
          }
          if (msg.type === "ai") {
            return <AIBubble key={msg.id} msg={msg as AIMessage}></AIBubble>;
          }
          // if (msg.type === "tool") {
          //   return <RenderToolCalls key={msg.id} msg={msg} />;
          // }

          return null;
        })}
      </MathJax>
    </ChatContainer>
  );
}
