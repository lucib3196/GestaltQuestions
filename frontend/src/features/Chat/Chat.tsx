import ChatContainer from "./components/ChatContainer";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { HumanBubble, AIBubble } from "./components/ChatBubble";
import { ChatInput } from "./components/ChatInput";
import { useStream } from "@langchain/react";
import RenderToolCalls from "./components/ToolCallRender";
import { useChatContext } from "./instance/context";

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
    const threadId = useChatContext((state) => state.theadId)
    console.log("Current thread id", threadId)
    const stream = useStream({
        threadId: null,
        apiUrl: "http://127.0.0.1:2024",
        assistantId: "agent_gestalt",
    });

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
