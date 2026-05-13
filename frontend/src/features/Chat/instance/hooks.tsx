import { questionAPIURL } from "../../../config/apiConfig";
import { useState, useRef } from "react";
import type { ChatMessage, StreamEvent, ParsedStreamEvent, BaseMessage } from "./types";
// import { ChatMessage } from "@langchain/core/messages";

function parseLangGraphEvent(parsed: StreamEvent): ParsedStreamEvent | null {
    try{
        switch (parsed.event) {
        // case "on_chain_start": {
        //     const last = parsed.data.input.messages.at(-1);
        //     if (!last) return null;
        //     return {
        //         type: "user_message",
        //         message: {
        //             type: "human",
        //             content: last.content,
        //             id: crypto.randomUUID(),
        //         },
        //     };
        // }

        case "on_chat_model_stream": {
            const token = parsed.data.chunk.content;

            if (!token) return null;

            return {
                type: "ai_token",
                content: token,
            };
        }

        default:
            console.log("Other", parsed)
            return null;
    }

    }catch (error){
        console.log("Got an error ", error)
    }
    
}

type useStream = {
    threadId?: string;
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    submit: (input: {
        messages: BaseMessage[];
        thread_id?: string | null;
    }) => Promise<void>;
    stop: () => Promise<void>;
};

export function useStream(): useStream {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const stop: useStream["stop"] = async () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsLoading(false);
    };

    const submit: useStream["submit"] = async (input) => {
        setIsLoading(true);
        setError(null);

        const controller = new AbortController();
        abortRef.current = controller;

        const userMsg = input.messages.at(-1);
        if (!userMsg) return;

        const content =
            typeof userMsg.content === "string"
                ? userMsg.content
                : JSON.stringify(userMsg.content);
        const id = userMsg.id ?? crypto.randomUUID();

        setMessages((prev) => [
            ...prev,
            {
                type: "human",
                content,
                id,
            },
        ]);

        // add the input message
        // setMessages((prev)=>[...prev, input.messages.at(-1)])

        try {
            const response = await fetch(`${questionAPIURL}/agents/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                },
                body: JSON.stringify({
                    thread_id: input.thread_id,
                    messages: input.messages,
                }),
            });

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const events = buffer.split("\n\n");
                buffer = events.pop() || "";

                for (const event of events) {
                    if (event.startsWith("data: ")) {
                        const jsonStr = event.replace("data: ", "");
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const event = parseLangGraphEvent(parsed.data);

                            if (!event) continue;

                            switch (event.type) {
                                case "user_message":
                                    setMessages((prev) => [...prev, event.message]);
                                    break;
                                case "ai_token":
                                    setMessages((prev) => {
                                        const last = prev.at(-1);

                                        if (!last || last.type !== "ai") {
                                            return [
                                                ...prev,
                                                {
                                                    id: crypto.randomUUID(),
                                                    type: "ai",
                                                    content: event.content,
                                                },
                                            ];
                                        }
                                        return prev.map((msg) =>
                                            msg.id === last.id
                                                ? {
                                                    ...msg,
                                                    content: msg.content + event.content,
                                                }
                                                : msg,
                                        );
                                    });
                                    break;
                            }

                            // Handle setting the message
                        } catch (err) {
                            console.error("Failed parse", err);
                        }
                    }
                }
            }

        } catch (e) {
            if (!(e instanceof DOMException && e.name === "AbortError")) {
                setError(e instanceof Error ? e.message : "Unknown error");
            }
        } finally {
            setIsLoading(false);
        }
    };
    return { messages, isLoading, error, submit, stop };
}
