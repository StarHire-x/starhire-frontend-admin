import {
  Sidebar,
  Search,
  ConversationList,
  Avatar,
  Conversation,
} from "@chatscope/chat-ui-kit-react";
import Image from 'next/image'
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

  return (
    <Sidebar position="left" scrollable={false}>
      <Search 
      placeholder="Search..."
      value={searchQuery}
      onChange={query => setSearchQuery(query)} 
      />
      <ConversationList>
        {filteredChats.length > 0 ? (
          filteredChats.map((value, index) => (
            <Conversation
              index={index}
              name={
                value.jobSeeker
                  ? value.jobSeeker.userName
                  : value.corporate.userName
              }
              onClick={() => selectCurrentChat(index)}
            >
            <Avatar>
              <Image src={HumanIcon} 
              alt="Profile Picture"
              name={
                value.jobSeeker
                  ? value.jobSeeker.userName
                  : value.corporate.userName
              }
              status="available"
              />
            </Avatar>
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
