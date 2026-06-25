import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { useStream } from "@langchain/react";
import { MathJax } from "better-react-mathjax";
import { useEffect, useMemo, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";

import type { SideBarItem } from "../../components/SideBar";
import SideBar from "../../components/SideBar/SideBar";
import { aiURL } from "../../config/apiConfig";
import { type ThreadRead } from "../../services/Chat";
import { useAuth } from "../Auth";
import { AIBubble, HumanBubble } from "./components/ChatBubble";
import ChatContainer from "./components/ChatContainer";
import { ChatInput } from "./components/ChatInput";
import RenderToolCalls from "./components/ToolCallRender";
import { useThreadStore } from "./instance/store";
import { prepareMessage } from "./utils";

function ChatSession() {
  const { user } = useAuth();
  const createThread = useThreadStore((state) => state.createThread);
  const threadId = useThreadStore((s) => s.threadId);

  const stream = useStream({
    threadId: threadId || null,
    apiUrl: aiURL,
    assistantId: "agent",
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
          if (msg.type === "tool") {
            return <RenderToolCalls key={msg.id} msg={msg} />;
          }

          return null;
        })}
      </MathJax>
    </ChatContainer>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const setThreadId = useThreadStore((s) => s.setThreadId);
  const getUserThreads = useThreadStore((s) => s.threads);
  const [token, setToken] = useState<string>("");
  const [showSideBar, setShowSideBar] = useState<boolean>(true);
  const [sessionKey, setSessionKey] = useState(0);
  const [threads, setThreads] = useState<ThreadRead[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!user) return;
      const authToken = await user.getIdToken();
      if (!isMounted) return;

      setToken(authToken);
      await loadUserThreads(authToken);
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [user, loadUserThreads]);

  const threadOptions: SideBarItem[] = useMemo(
    () =>
      threads.map((t) => ({
        key: t.id,
        label: t.id,
      })),
    [threads],
  );

  const handleNewChat = () => {
    setSelectedThreadId("");
    setThreadId(null);
    setSessionKey((k) => k + 1);
  };

  const handleSelectThread = (val: string) => {
    const id = String(val).trim();
    setSelectedThreadId(id);
    setThreadId(id);
    setSessionKey((k) => k + 1);
  };

  if (!token) {
    return (
      <div className="w-full p-4 text-sm text-text-muted">Loading chat...</div>
    );
  }

  return (
    <div className="flex flex-row">
      <div
        className={`flex flex-col border-r border-border pr-3 transition-all duration-200 ease-in-out ${
          showSideBar ? "w-72 gap-2" : "w-10 gap-0"
        }`}
      >
        <button
          type="button"
          aria-label={showSideBar ? "Close sidebar" : "Open sidebar"}
          onClick={() => setShowSideBar((prev) => !prev)}
          className="self-end rounded p-1 transition-colors duration-150 hover:bg-bg-secondary"
        >
          <GiHamburgerMenu />
        </button>
        <div
          className={`overflow-hidden transition-opacity duration-150 ${
            showSideBar ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <SideBar
            selected={selectedThreadId}
            setSelected={handleSelectThread}
            options={threadOptions}
            show={showSideBar}
          />
        </div>
      </div>

      <div className="w-full pl-3">
        <ChatSession key={sessionKey} onNewChat={handleNewChat} token={token} />
      </div>
    </div>
  );
}
