import {
  Sidebar,
  Search,
  ConversationList,
  Avatar,
  Conversation,
} from "@chatscope/chat-ui-kit-react";

const ChatSidebar = ({ userChats, selectCurrentChat, currUserId }) => {
  return (
    <Sidebar position="left" scrollable={false}>
      <Search placeholder="Search..." />
      <ConversationList>
        {userChats.length > 0 ? (
          userChats.map((value, index) => (
            <Conversation
              index={index}
              name={
                value.jobSeeker
                  ? value.jobSeeker.userName
                  : value.corporate.userName
              }
              lastSenderName={
                value.jobSeeker
                  ? value.jobSeeker.userName
                  : value.corporate.userName
              }
              info="Sample message"
              onClick={() => selectCurrentChat(index)}
            >
              <Avatar
                src=""
                name={
                  value.jobSeeker
                    ? value.jobSeeker.userName
                    : value.corporate.userName
                }
                status="available"
              />
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
