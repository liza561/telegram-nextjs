"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { VideoIcon, LogOutIcon } from "lucide-react";

function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const { channel, setActiveChannel, client } = useChatContext();
  const { setOpen } = useSidebar();
  const searchParams = useSearchParams();
  const chatUserId = searchParams?.get("chatUser");

  // Open existing chat or create a new 1-on-1 chat
  const openOrCreateChatWithUser = async (otherUserId: string) => {
    if (!client || !user?.id) return;

    try {
      // 1. Query channels where the current user is a member
      const channels = await client.queryChannels({
        type: "messaging",
        members: { $in: [user.id] },
      });

      // 2. Check if a 1-on-1 channel already exists with the target user
      let existingChannel = channels.find((ch) => {
        const memberIds = Object.keys(ch.state.members);
        return (
          memberIds.length === 2 &&
          memberIds.includes(user.id) &&
          memberIds.includes(otherUserId)
        );
      });

      // 3. If no existing channel → create a new one
      if (!existingChannel) {
        existingChannel = client.channel("messaging", {
          members: [user.id, otherUserId],
        });
      }

      // 4. Watch the channel and set as active
      await existingChannel.watch();
      setActiveChannel(existingChannel);
    } catch (err) {
      console.error("Error opening or creating chat:", err);
    }
  };

  useEffect(() => {
    if (!chatUserId) return;
    openOrCreateChatWithUser(chatUserId);
  }, [chatUserId]);

  const handleCall = () => {
    if (!channel) return;
    router.push(`/dashboard/video-call/${channel.id}`);
    setOpen(false);
  };

  const handleLeaveChat = async () => {
    if (!channel || !user?.id) return;

    const confirm = window.confirm("Are you sure you want to leave the chat?");
    if (!confirm) return;

    try {
      await channel.removeMembers([user.id]);
      setActiveChannel(undefined);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving chat:", error);
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      {channel ? (
        <Channel>
          <Window>
            <div className="flex items-center justify-between">
              {channel.data?.member_count === 1 ? (
                <ChannelHeader title="Everyone else has left this chat!" />
              ) : (
                <ChannelHeader />
              )}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCall}>
                  <VideoIcon className="w-4 h-4" />
                  Video Call
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLeaveChat}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Leave Chat
                </Button>
              </div>
            </div>

            <MessageList />
            <div className="sticky bottom-0 w-full">
              <MessageInput focus />
            </div>
          </Window>
          <Thread />
        </Channel>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
            No Chat Selected
          </h2>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or start a new conversation
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
