"use client";
import React, { useRef } from "react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import io from "socket.io-client";
import moment from "moment";
import {
  MainContainer,
  Avatar,
  ChatContainer,
  ConversationHeader,
  MessageList,
  MessageSeparator,
  Message,
  MessageInput,
  InfoButton,
  SendButton,
  AttachmentButton,
} from "@chatscope/chat-ui-kit-react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import HumanIcon from "../../../public/icon.png";

import { getAllUserChats, getOneUserChat } from "../api/chat/route";
import { uploadFile } from "../api/upload/route";
import Enums from "@/common/enums/enums";

const Chat = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const params = useSearchParams();
  const chatId = params.get("id");

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const currentUserId =
    session.status === "authenticated" && session.data.user.userId;

  const fileInputRef = useRef(null);
  const [messageInputValue, setMessageInputValue] = useState("");
  const [chatMessagesByDate, setChatMessagesByDate] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null); // user object
  const [allChats, setAllChats] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    // WebSocket functions
    const socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`);
    setSocket(socket);

    // Clean-up logic when the component unmounts (if needed)
    return () => {
      // Close the socket or remove event listeners, if necessary
      socket.close(); // Close the socket when the component unmounts
    };
  }, []); // The empty dependency array [] means this effect runs once after the initial render

  // returns list of lists
  const getDateStringByTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-SG");
  };
  const splitMessagesByDate = (chatMessages) => {
    let dateMessageMap = {};

    for (let message of chatMessages) {
      if (!message.timestamp) {
        continue;
      }
      const date = getDateStringByTimestamp(message.timestamp);
      if (dateMessageMap[date] === undefined) {
        dateMessageMap[date] = [message];
      } else {
        dateMessageMap[date].push(message);
      }
    }
    return Object.values(dateMessageMap);
  };

  const sendMessage = (message) => {
    socket?.emit("sendMessage", message);
  };

  socket?.on(currentChat ? currentChat.chatId : null, (message) => {
    receiveMessage(message);
  });

  const formatRawDate = (rawDate) => {
    const formattedDate = moment(rawDate).format("h:mm A");
    return formattedDate;
  };
  const receiveMessage = (message) => {
    if (!message.timestamp) {
      return;
    }
    if (chatMessagesByDate.length > 0) {
      if (
        getDateStringByTimestamp(
          chatMessagesByDate.slice(-1)[0][0].timestamp
        ) == getDateStringByTimestamp(message.timestamp)
      ) {
        let newChatMessagesByDate = chatMessagesByDate;
        const lastElement = [
          ...newChatMessagesByDate[newChatMessagesByDate.length - 1],
          message,
        ];
        setChatMessagesByDate([
          ...newChatMessagesByDate.slice(0, -1),
          lastElement,
        ]);
      } else {
        setChatMessagesByDate([...chatMessagesByDate, [message]]);
      }
    } else {
      setChatMessagesByDate([[message]]);
    }
  };

  const handleSendMessage = async (content) => {
    setLoading(true);
    // get fileURL here
    let fileURL = "";
    if (attachedFile) {
      try {
        fileURL = await uploadFile(attachedFile, accessToken);
      } catch (error) {
        console.error("There was an error uploading the file", error);
      }
    }
    sendMessage({
      userId: currentUserId,
      chatId: currentChat ? currentChat.chatId : null,
      message: messageInputValue,
      isImportant: isImportant,
      timestamp: new Date(),
      fileURL: fileURL ? fileURL.url : "",
    });
    setMessageInputValue("");
    setAttachedFile(null);
    setLoading(false);
  };

  const handleAttachClick = () => {
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files[0]; // Get the selected file
    setAttachedFile(selectedFile);
  };

  async function getUserChats(currentUserId, accessToken) {
    const chats = await getAllUserChats(currentUserId, accessToken);
    setAllChats(chats);
  }

  const selectCurrentChat = async (chatId) => {
    if (accessToken) {
      socket.off(currentChat?.chatId);
      socket.on(chatId, (message) => {
        receiveMessage(message);
      });
      const chatMessagesByCurrentChatId = await getOneUserChat(
        chatId,
        accessToken
      );
      setCurrentChat(chatMessagesByCurrentChatId);
    }
  };

  useEffect(() => {
    if (accessToken) {
      const findChatId = async () => {
        return await getOneUserChat(chatId, accessToken);
      };
      if (chatId) {
        findChatId().then((chat) => setCurrentChat(chat));
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (accessToken) {
      if (session.status === "authenticated") {
        getUserChats(currentUserId, accessToken);
      }
    }
  }, [session.status, currentUserId, accessToken]);

  useEffect(() => {
    if (currentChat) {
      const chatMessages = currentChat?.chatMessages;
      chatMessages.sort(
        (message1, message2) => message1.timestamp > message2.timestamp
      );
      setChatMessagesByDate(splitMessagesByDate(chatMessages));
    }

    if (currentChat) {
      setCurrentUser(currentChat.recruiter);
      setOtherUser(currentChat.jobSeeker || currentChat.corporate);
    }
  }, [currentChat]);

  if (
    session.status === "authenticated" &&
    session.data.user.role === Enums.RECRUITER
  ) {
    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
        <MainContainer responsive style={{ height: "75vh" }}>
          <ChatSidebar
            userChats={allChats}
            selectCurrentChat={selectCurrentChat}
          />
          {currentChat !== null ? (
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Back />
                <Avatar>
                  {otherUser && otherUser.profilePictureUrl != "" ? (
                    <img src={otherUser.profilePictureUrl} alt="user" />
                  ) : (
                    <Image src={HumanIcon} alt="Profile Picture" />
                  )}
                </Avatar>
                <ConversationHeader.Content
                  userName={otherUser ? otherUser.userName : ""}
                />
                <ConversationHeader.Actions></ConversationHeader.Actions>
              </ConversationHeader>
              <ChatHeader />
              <MessageList loadingMore={loading} loadingMorePosition="bottom">
                {chatMessagesByDate.length > 0 &&
                  chatMessagesByDate.map((chatMessages, index) => (
                    <>
                      <MessageSeparator
                        key={index}
                        content={
                          chatMessages.length > 0
                            ? `${getDateStringByTimestamp(
                                chatMessages[0].timestamp
                              )}`
                            : ""
                        }
                      />
                      {chatMessages.map((value, index) => (
                        <Message
                          key={index}
                          index={index}
                          model={{
                            sentTime: value.timestamp,
                            sender:
                              value.userId == currentUserId
                                ? currentUser.userId
                                : otherUser.userId,
                            direction:
                              value.userId == currentUserId
                                ? "outgoing"
                                : "incoming",
                            position: "single",
                          }}
                        >
                          <Avatar>
                            {value.userId == currentUserId ? (
                              currentUser &&
                              currentUser.profilePictureUrl != "" ? (
                                <img
                                  src={currentUser.profilePictureUrl}
                                  alt="user"
                                />
                              ) : (
                                <Image src={HumanIcon} alt="Profile Picture" />
                              )
                            ) : otherUser &&
                              otherUser.profilePictureUrl != "" ? (
                              <img
                                src={otherUser.profilePictureUrl}
                                alt="user"
                              />
                            ) : (
                              <Image src={HumanIcon} alt="Profile Picture" />
                            )}
                          </Avatar>
                          <Message.CustomContent>
                            {value.isImportant ? (
                              <>
                                <b>*Notification Sent*</b>
                                <br />
                              </>
                            ) : (
                              <></>
                            )}
                            {value.fileURL != "" ? (
                              <>
                                <b style={{ color: "#00008B" }}>
                                  <a href={`${value.fileURL}`} target="_blank">
                                    Download Attachment
                                  </a>
                                </b>
                                <br />
                              </>
                            ) : (
                              <></>
                            )}
                            {value.message}
                          </Message.CustomContent>
                          <Message.Footer>
                            {formatRawDate(value.timestamp)}
                          </Message.Footer>
                        </Message>
                      ))}
                    </>
                  ))}
              </MessageList>
              <div
                as={MessageInput}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  borderTop: "1px dashed #d1dbe4",
                }}
              >
                <AttachmentButton
                  style={{
                    fontSize: "1.2em",
                    paddingLeft: "0.5em",
                    paddingRight: "0.2em",
                  }}
                  onClick={handleAttachClick}
                />
                <MessageInput
                  placeholder={
                    attachedFile
                      ? `File attached: ${attachedFile.name}`
                      : "Type message here"
                  }
                  onChange={(innerHtml, textContent, innerText) =>
                    setMessageInputValue(innerText)
                  }
                  value={messageInputValue}
                  sendButton={false}
                  attachButton={false}
                  onSend={handleSendMessage}
                  style={{
                    flexGrow: 1,
                    borderTop: 0,
                    flexShrink: "initial",
                    caretColor: "#000000",
                  }}
                />
                {isImportant ? (
                  <InfoButton
                    onClick={() => setIsImportant(false)}
                    border
                    style={{
                      fontSize: "1.2em",
                      paddingLeft: "0.2em",
                      paddingRight: "0.2em",
                    }}
                  />
                ) : (
                  <InfoButton
                    onClick={() => setIsImportant(true)}
                    style={{
                      fontSize: "1.2em",
                      paddingLeft: "0.2em",
                      paddingRight: "0.2em",
                    }}
                  />
                )}
                <SendButton
                  onClick={handleSendMessage}
                  disabled={messageInputValue.length === 0}
                  style={{
                    fontSize: "1.2em",
                    marginLeft: 0,
                    paddingLeft: "0.2em",
                    paddingRight: "1em",
                  }}
                />
              </div>
            </ChatContainer>
          ) : (
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: "50%",
                left: "50%",
              }}
            >
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </MainContainer>
      </>
    );
  } else {
    router?.push("/dashboard");
  }
};

export default Chat;
