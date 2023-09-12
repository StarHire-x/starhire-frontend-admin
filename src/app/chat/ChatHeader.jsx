import {
  ConversationHeader,
  VideoCallButton,
  EllipsisButton,
  Avatar,
  VoiceCallButton,
} from "@chatscope/chat-ui-kit-react";
import Image from 'next/image'
import HumanIcon from "../../../public/icon.png";

const ChatHeader = () => {
  return (
    <ConversationHeader>
      <ConversationHeader.Back />
      <Avatar src={HumanIcon} name="Zoe" />
      <ConversationHeader.Content userName="Zoe" info="Active 10 mins ago" />
      <ConversationHeader.Actions>
        <VoiceCallButton />
        <VideoCallButton />
        <EllipsisButton orientation="vertical" />
      </ConversationHeader.Actions>
    </ConversationHeader>
  );
};

export default ChatHeader;