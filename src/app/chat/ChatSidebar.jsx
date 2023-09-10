import {
  Sidebar,
  Search,
  ConversationList,
  Avatar,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
import { useEffect, useState } from "react";

const ChatSidebar = ({ userChats }) => {
  return (
    <Sidebar position="left" scrollable={false}>
      <Search placeholder="Search..." />

      <ConversationList>
        {userChats.length >= 0 ? (
          userChats.map((value, index) => (
            <Conversation
              name="Lilly"
              lastSenderName="Lilly"
              info="Yes i can do it for you"
            >
              <Avatar src="" name="Lilly" status="available" />
            </Conversation>
          ))
        ) : (
          <h2>No chat history</h2>
        )}
      </ConversationList>
    </Sidebar>
  );
};

export default ChatSidebar;
