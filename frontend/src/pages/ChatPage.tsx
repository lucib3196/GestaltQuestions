import { ChatSession } from "../features/Chat/Chat";
import { SideBarMenu } from "../components/SideBar";
import { IoIosSettings } from "react-icons/io";
import { FaRegPenToSquare } from "react-icons/fa6";

export default function ChatPage() {
    const handleCreateChat = () => {
        console.log("Creating a new chat");
    };

    const handleOpenChatSettings = () => {
        console.log("Opening chat settings");
    };

    return (
        <div className="flex h-dvh min-h-0 flex-row overflow-hidden p-2">
            <SideBarMenu headerName="Chat" height="sticky">
                <SideBarMenu.Content>
                    <button
                        type="button"
                        onClick={handleCreateChat}
                        className="mx-4 my-3 flex w-[calc(100%-2rem)] items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <FaRegPenToSquare aria-hidden="true" />
                        New chat
                    </button>
                </SideBarMenu.Content>

                <div className="flex flex-2 flex-col overflow-y-auto overflow-x-hidden">
                    <div className="mx-5 my-3 flex justify-start border-b text-base">
                        Chats
                    </div>
                    <SideBarMenu.Item item={"value"} label={"item"}></SideBarMenu.Item>
                    <SideBarMenu.Item item={"value2"} label={"item"}></SideBarMenu.Item>
                    <SideBarMenu.Item item={"value3"} label={"item"}></SideBarMenu.Item>
                    <SideBarMenu.Item item={"value4"} label={"item"}></SideBarMenu.Item>
                    <SideBarMenu.Item item={"value5"} label={"item"}></SideBarMenu.Item>
                    <SideBarMenu.Item item={"value6"} label={"item"}></SideBarMenu.Item>
                    <SideBarMenu.Item item={"value4"} label={"item"}></SideBarMenu.Item>
                </div>

                <SideBarMenu.Footer>
                    <button
                        type="button"
                        onClick={handleOpenChatSettings}
                        className="mx-4 flex w-[calc(100%-2rem)] items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium text-text transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        Settings
                        <IoIosSettings size={24} aria-hidden="true" />
                    </button>
                </SideBarMenu.Footer>
            </SideBarMenu>
            <div className="min-h-0 grow overflow-hidden">
                <ChatSession />
            </div>
        </div>
    );
}
