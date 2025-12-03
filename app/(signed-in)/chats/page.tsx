"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoIcon, MessageSquare } from "lucide-react";

export default function ChatsPage() {
  const { user } = useUser();
  const router = useRouter();

  const users = useQuery(api.users.getAllUsers);

  if (!users) return <p className="p-6">Loading...</p>;

  // Open chat with this user
  const openChat = (userId: string) => {
    router.push(`/dashboard?chatUser=${userId}`);
  };

  // Open video call with this user
  const startCall = (userId: string) => {
    router.push(`/dashboard/video-call/${userId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">All Users</h1>

      {/* GRID OF CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {users
          .filter((u) => u.userId !== user?.id)
          .map((u) => (
            <Card
              key={u._id}
              className="rounded-xl border p-3 hover:shadow-md transition"
            >
              <CardHeader className="items-center p-0 pb-2">
                <img
                  src={u.imageURL}
                  className="w-20 h-20 rounded-full object-cover border"
                />
              </CardHeader>

              <CardContent className="text-center p-0 space-y-2">
                <CardTitle className="text-sm font-medium">{u.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{u.email}</p>

                {/* ACTION BUTTONS */}
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openChat(u.userId)}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>


                  <Button
                    size="sm"
                    onClick={() => startCall(u.userId)}
                  >
                    <VideoIcon className="w-4 h-4 mr-1" />
                     Video Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
