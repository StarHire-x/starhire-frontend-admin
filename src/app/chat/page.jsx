"use client";
import React from "react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  MainContainer,
  Avatar,
  ChatContainer,
  ConversationHeader,
  VoiceCallButton,
  VideoCallButton,
  MessageList,
  TypingIndicator,
  MessageSeparator,
  Message,
  MessageInput,
  EllipsisButton,
} from "@chatscope/chat-ui-kit-react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";

const Chat = () => {
  const currUserId = 1; // should get from session
  // const session = useSession();
  // const router = useRouter();
  // if (session.status === "unauthenticated") {
  //   router?.push("/login");
  // }
  const socket = io("http://localhost:8080");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState({
    chatId: 1,
    jobSeeker: { userId: 1, userName: "Samantha" }, // in future API should only return both user's details
    recruiter: { userId: 2, userName: "Joe" },
    chatMessages: [
      { chatMessageId: 1, message: "hi there", isImportant: false, userId: 1 },
      {
        chatMessageId: 2,
        message: "hello noob",
        isImportant: false,
        userId: 2,
      },
      { chatMessageId: 3, message: "you suck", isImportant: false, userId: 1 },
      {
        chatMessageId: 4,
        message: "you suck 2",
        isImportant: false,
        userId: 2,
      },
    ],
  });
  const [currUser, setCurrUser] = useState();
  const [otherUser, setOtherUser] = useState(); // user object
  const [allChats, setAllChats] = useState([
    { chatId: 2 },
    { chatId: 3 },
    { chatId: 4 },
  ]);

  const [messageInputValue, setMessageInputValue] = useState("");

  function sendMessage(message) {
    socket.emit("sendMessage", message);
  }

  useEffect(() => {
    // sendMessage({ email: "helloworld@gmail.com", text: "hello" });
    setChatMessages(currentChat.chatMessages);
    if (
      currentChat.jobSeeker.userId == currUserId ||
      currentChat.corporate.userId == currUserId
    ) {
      setCurrUser(currentChat.jobSeeker || currentChat.corporate);
      setOtherUser(currentChat.recruiter);
    } else {
      setCurrUser(currentChat.recruiter);
      setOtherUser(currentChat.jobSeeker || currentChat.corporate);
    }
  }, [currentChat]);

  return (
    <MainContainer responsive>
      <ChatSidebar userChats={allChats} />

      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Back />
          <Avatar src="" name="Zoe" />
          <ConversationHeader.Content
            userName="Zoe"
            info="Active 10 mins ago"
          />
          <ConversationHeader.Actions>
            <VoiceCallButton />
            <VideoCallButton />
            <EllipsisButton orientation="vertical" />
          </ConversationHeader.Actions>
        </ConversationHeader>
        <ChatHeader />
        <MessageList
          typingIndicator={<TypingIndicator content="Zoe is typing" />}
        >
          <MessageSeparator content="Saturday, 30 November 2019" />
          {chatMessages.length > 0 &&
            chatMessages.map((value, index) => (
              <Message
                index={index}
                model={{
                  message: value.message,
                  sentTime: "15 mins ago",
                  sender:
                    value.userId == currUserId
                      ? currUser.userName
                      : otherUser.userName,
                  direction:
                    value.userId == currUserId ? "outgoing" : "incoming",
                  position: "single",
                }}
              >
                <Avatar
                  src=""
                  name={
                    value.userId == currUserId
                      ? currUser.userName
                      : otherUser.userName
                  }
                />
              </Message>
            ))}
        </MessageList>
        <MessageInput
          placeholder="Type message here"
          value={messageInputValue}
          onChange={(val) => setMessageInputValue(val)}
        />
      </ChatContainer>
    </MainContainer>
  );
};

export default Chat;
