import {
  Sidebar,
  Search,
  ConversationList,
  Avatar,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
import Image from "next/image";
import HumanIcon from "../../../public/icon.png";
import { useState } from "react";

const ChatSidebar = ({ userChats, selectCurrentChat }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Create a new array called filteredChats that include those userNames where it match the search query.
  const filteredChats = userChats.filter((value) => {
    const userName = value.jobSeeker
      ? value.jobSeeker.userName
      : value.corporate.userName;

    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <Sidebar position="left" scrollable={true}>
      <Search
        placeholder="Search..."
        value={searchQuery}
        onChange={(query) => setSearchQuery(query)}
        onClearClick={handleClearSearch}
      />

      <ConversationList>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat, index) => (
            <Conversation
              key={chat.chatId}
              index={index}
              name={
                chat.jobSeeker
                  ? chat.jobSeeker.userName
                  : chat.corporate.userName
              }
              onClick={() => selectCurrentChat(chat.chatId)}
            >
              <Avatar>
                <Image
                  src={HumanIcon}
                  alt="Profile Picture"
                  name={
                    chat.jobSeeker
                      ? chat.jobSeeker.userName
                      : chat.corporate.userName
                  }
                  status="available"
                />
              </Avatar>
            </Conversation>
          ))
        ) : (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "40%",
              left: "30%",
            }}
          >
            <p>No Chat History</p>
          </div>
        )}
      </ConversationList>
    </Sidebar>
  );
};

export default ChatSidebar;
