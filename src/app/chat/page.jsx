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
import { getAllUserChats } from "../api/auth/chat/route";

const Chat = () => {
  const currentUserId = 1; // should get from session
  // const session = useSession();
  // const router = useRouter();
  // if (session.status === "unauthenticated") {
  //   router?.push("/login");
  // }
  const [messageInputValue, setMessageInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null); // user object
  const [allChats, setAllChats] = useState([
    {
      chatId: 1,
      jobSeeker: { userId: 2, userName: "Joe" }, // in future API should only return both user's details
      recruiter: { userId: 1, userName: "Samantha" },
      chatMessages: [
        {
          chatMessageId: 1,
          message: "hi there",
          isImportant: false,
          userId: 1,
        },
        {
          chatMessageId: 2,
          message: "hello noob",
          isImportant: false,
          userId: 2,
        },
        {
          chatMessageId: 3,
          message: "you suck",
          isImportant: false,
          userId: 1,
        },
        {
          chatMessageId: 4,
          message: "you suck 2",
          isImportant: false,
          userId: 2,
        },
      ],
    },
    {
      chatId: 2,
      corporate: { userId: 3, userName: "Bool" }, // in future API should only return both user's details
      recruiter: { userId: 1, userName: "Samantha" },
      chatMessages: [],
    },
    {
      chatId: 3,
      corporate: { chatId: 4, userName: "Lool" },
      recruiter: { userId: 1, userName: "Samantha" },
      chatMessages: [],
    },
    {
      chatId: 4,
      corporate: { chatId: 5, userName: "Hahag" },
      recruiter: { userId: 1, userName: "Samantha" },
      chatMessages: [],
    },
  ]);

  // WebSocket functions
  const socket = io("http://localhost:8080");

  const sendMessage = (message) => {
    socket.emit("sendMessage", message);
  };

  const receiveMessage = (message) => {
    setChatMessages([...chatMessages, message]);
  };

  socket.on(currentChat ? currentChat.chatId : null, (message) => {
    receiveMessage(message);
  });

  const handleSendMessage = (content) => {
    sendMessage({
      userId: currentUserId,
      chatId: currentChat ? currentChat.chatId : null,
      message: content,
      isImportant: false,
    });
    setMessageInputValue("");
  };

  const selectCurrentChat = (index) => {
    if (index < allChats.length) {
      setCurrentChat(allChats[index]);
    }
  };

  useEffect(() => {
    async function getUserChats() {
      const chats = await getAllUserChats(currentUserId);
      setAllChats(chats);
    }
    getUserChats();
  }, []);
  useEffect(() => {
    setChatMessages(currentChat ? currentChat.chatMessages : []);
    if (currentChat) {
      setCurrentUser(currentChat.recruiter);
      setOtherUser(currentChat.jobSeeker || currentChat.corporate);
    }
  }, [currentChat]);

  return (
    <MainContainer responsive>
      <ChatSidebar userChats={allChats} selectCurrentChat={selectCurrentChat} />

      <ChatContainer>
        <ConversationHeader>
          <ConversationHeader.Back />
          <Avatar src="" name={otherUser ? otherUser.userName : ""} />
          <ConversationHeader.Content
            userName={otherUser ? otherUser.userName : ""}
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
          typingIndicator={
            <TypingIndicator
              content={`${otherUser ? otherUser.userName : ""} is typing`}
            />
          }
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
                    value.userId == currentUserId
                      ? currentUser.userId
                      : otherUser.userId,
                  direction:
                    value.userId == currentUserId ? "outgoing" : "incoming",
                  position: "single",
                }}
              >
                <Avatar
                  src=""
                  name={
                    value.userId == currentUserId
                      ? currentUser.userName
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
          onSend={(textContent) => handleSendMessage(textContent)}
        />
      </ChatContainer>
    </MainContainer>
  );
};

export default Chat;
