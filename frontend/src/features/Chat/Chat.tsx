import ChatContainer from "./components/ChatContainer";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { HumanBubble, AIBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
import { useStream } from "@langchain/react";
import RenderToolCalls from "./components/ToolCallRender";
import { useChatContext } from "./instance/context";
import { useAuth } from "../Auth";
import { useCallback, useEffect } from "react";
import ChatApi from "./ChatApi";

async function blobURLtoBase64(blobUrl: string): Promise<string> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}

export default function Chat() {
    const { user } = useAuth()
    const threadId = useChatContext((s) => s.theadId)
    const createThread = useChatContext((state) => state.createdThread)
    const setThreadId = useChatContext((s) => s.setThreadId)

    const getToken = useCallback(async () => {
        if (!user) throw new Error("User not authenticated")
        return user.getIdToken()
    }, [user])


    const stream = useStream({
        threadId: threadId || undefined, // no thread => no stream session yet
        apiUrl: "http://127.0.0.1:2024",
        assistantId: "agent_gestalt",
        onThreadId: async (id: string) => {
            if (!user) return null
            const token = await getToken()
            // Create and set the thread id 
            await createThread(token, id)
            setThreadId(id)
        },
    })

    const handleSubmit = async (
        text: string,
        images?: string[] | null | undefined,
    ) => {
        type ContentItem =
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string } };

        let content: ContentItem[] = [{ type: "text", text: text }];

        if (images && images.length > 0) {
            const b64 = await blobURLtoBase64(images[0]);
            content.push({
                type: "image_url",
                image_url: { url: b64 },
            });
        }

        const payload = [
            {
                role: "human",
                content: content,
            },
        ];
        
        stream.submit({ messages: payload });
        await ChatApi.createMessage(threadId, payload)
    };

    return (
        <ChatContainer
            size="lg"
            input={
                <ChatInput
                    handleSubmit={handleSubmit}
                    disabled={stream.isLoading}
                    multiModal={true}
                />
            }
        >
            {stream.messages.length === 0}
            {stream.messages.map((msg) => {
                if (msg.type === "human") {
                    return <HumanBubble key={msg.id} msg={msg as HumanMessage} />;
                }

                if (msg.type === "ai") {
                    return <AIBubble key={msg.id} msg={msg as AIMessage}></AIBubble>;
                }

                if (msg.type === "tool") {
                    return (
                        <>
                            <RenderToolCalls msg={msg} />
                        </>
                    );
                }

                return null;
            })}
        </ChatContainer>
    );
}
