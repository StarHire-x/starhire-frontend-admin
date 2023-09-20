import {
  Sidebar,
  Search,
  ConversationList,
  Avatar,
  Conversation,
  Button,
  EllipsisButton,
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

  const handleClickEllipses = () => {
    window.location.href = "/create-chat";
  };

  return (
    <Sidebar position="left" scrollable={true}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Search
          placeholder="Search..."
          value={searchQuery}
          onChange={(query) => setSearchQuery(query)}
          onClearClick={handleClearSearch}
          style={{ width: "80%" }}
        />
        <EllipsisButton orientation="vertical" onClick={handleClickEllipses} />
      </div>
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
                {chat.jobSeeker ? (
                  chat.jobSeeker.profilePictureUrl != "" ? (
                    <img src={chat.jobSeeker.profilePictureUrl} alt="user" />
                  ) : (
                    <Image src={HumanIcon} alt="Profile Picture" />
                  )
                ) : chat.corporate.profilePictureUrl != "" ? (
                  <img src={chat.corporate.profilePictureUrl} alt="user" />
                ) : (
                  <Image src={HumanIcon} alt="Profile Picture" />
                )}
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
