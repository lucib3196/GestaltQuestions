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
import { type InterruptOnConfig } from "langchain";
import { BaseMessage } from "@langchain/core/messages";
import type { HITLRequest, HITLResponse } from "langchain";
import { ApprovalCard } from "./components/hitlApproval";
import { useState } from "react";

export function ChatSession() {
  // User
  const { user } = useAuth();
  // Thread management
  const createThread = useThreadStore((state) => state.createThread);
  const threadId = useThreadStore((s) => s.threadId);
  // Chat Context
  const assistantId = useChatStore((s) => s.assistantId);
  const model = useChatStore((s) => s.model);

  const stream = useStream({
    threadId: threadId || null,
    apiUrl: aiURL,
    assistantId: assistantId,
    apiKey: import.meta.env.VITE_LANGSMITH_API_KEY,
    onThreadId: async (id: string) => {
      await createThread(id, await user?.getIdToken());
    },
  });

  const { messages, isLoading, interrupt } = stream;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (text: string, images?: string[]) => {
    const content = await prepareMessage(text, images);
    stream.submit(
      {
        messages: [
          {
            role: "human",
            content,
          },
        ],
      },
      {
        context: {
          model: model,
        },
      },
    );
  };

  // Unpack human in the loop validation.
  const hitlRequest = interrupt?.value as HITLRequest | undefined;
  const actionRequests = hitlRequest?.actionRequests ?? [];
  const reviewConfigs = hitlRequest?.reviewConfigs ?? [];

  console.log("Interrupt", reviewConfigs);

  // Handle approve for HITL
  const handleApprove = async () => {
    if (!hitlRequest) return;
    setIsProcessing(true);
    try {
      const resume: HITLResponse = {
        decisions: actionRequests.map(() => ({
          type: "approve",
        })),
      };
      await stream.submit(null, { command: { resume: resume } });
      console.log("Sent request")
      // await stream.respond(resume);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (index: number, reason: string) => {
    if (!hitlRequest) return;
    setIsProcessing(true);
    try {
      const resume: HITLResponse = {
        decisions: actionRequests.map((_, i) =>
          i === index
            ? { type: "reject" as const, message: reason || "User rejected" }
            : {
                type: "reject" as const,
                message: "Rejected along with other actions",
              },
        ),
      };
      await stream.submit(null, { command: { resume: resume } });
      
    } finally {
      setIsProcessing(false);
    }
  };
  const handleEdit = async (
    index: number,
    editedArgs: Record<string, unknown>,
  ) => {
    if (!hitlRequest) return;
    setIsProcessing(true);
    try {
      const originalAction = actionRequests[index];
      const resume: HITLResponse = {
        decisions: actionRequests.map((_, i) =>
          i === index
            ? {
                type: "edit" as const,
                editedAction: { name: originalAction.name, args: editedArgs },
              }
            : { type: "approve" as const },
        ),
      };
      await stream.submit(null, { command: { resume: resume } });
      // await stream.respond(resume);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasMessages = messages.length > 0;

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
        {messages.map((msg) => {
          // console.log("MSG",msg, )
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

        {/* Handle the hitl request */}
        {hitlRequest && actionRequests.length > 0 && !isProcessing && (
          <div className="">
            {actionRequests.map((actionRequest, idx) => (
              <ApprovalCard
                key={idx}
                actionRequest={actionRequest}
                reviewConfig={reviewConfigs[idx]}
                onApprove={() => handleApprove()}
                onReject={(reason) => handleReject(idx, reason)}
                onEdit={(editedArgs) => handleEdit(idx, editedArgs)}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </MathJax>
    </ChatContainer>
  );
}
