"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Menu, UserCog, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ConversationHistoryItem {
  id: string;
  call_id: string;
  status: string;
  created_at: string;
  scenarios: {
    subject: string;
    service: string;
  } | null;
}

export default function Sidebar() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeId = searchParams.get("id");

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [history, setHistory] = useState<ConversationHistoryItem[]>([]);

  const [personaInfo, setPersonaInfo] = useState({
    name: "",
    role: "",
    tone: "Professional",
    o_score: 50,
    c_score: 50,
    e_score: 50,
    a_score: 50,
    n_score: 50
  });

  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
          id,
          call_id,
          status,
          created_at,
          scenarios (
            subject,
            service
          )
        `)
      .eq('user_id', user?.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    if (data) {
      const formattedData = data.map(item => ({
        ...item,
        scenarios: Array.isArray(item.scenarios) ? item.scenarios[0] : item.scenarios
      }));
      setHistory(formattedData as ConversationHistoryItem[]);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe();

    fetchHistory();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeId]);

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_deleted: true }) // Soft delete
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== id));

      if (searchParams.get("id") === id) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("Cannot delete conversation. Please try again.");
    }
  };

  return (
    <Suspense>
      <aside
        className={cn(
          "bg-sidebar flex flex-col h-full transition-all duration-300 ease-in-out p-4 border-r",
          isCollapsed ? "w-[70px]" : "w-[280px]"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="mb-4 rounded-full hover:bg-gray-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu size={20} className="text-sidebar-text-secondary" />
        </Button>

        {/* New conversation button */}
        <Button
          onClick={() => router.push("/")}
          className={cn(
            "justify-start gap-2 mb-8 bg-white text-black hover:bg-gray-100 rounded-full shadow-sm border overflow-hidden whitespace-nowrap",
            isCollapsed ? "px-2 w-10" : "px-4 w-full"
          )}
        >
          <Plus size={20} className="shrink-0" />
          {!isCollapsed && <span>New conversation</span>}
        </Button>

        {/* Conversation history */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-500 mb-2 px-2 uppercase tracking-tight">Recent</p>
          )}
          <ScrollArea className="flex-1">
            {history.map((item) => {
              const isActive = activeId === item.id;

              return (
                <div
                  key={item.id}
                  title={item.scenarios?.subject || "No Subject"}
                  onClick={() => router.push(`/?id=${item.id}`)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-full cursor-pointer transition-all mb-1 overflow-hidden group",
                    isCollapsed ? "justify-center" : "",
                    isActive
                      ? "bg-gemini-blue/10 text-gemini-blue font-medium"
                      : "hover:bg-gemini-hover text-sidebar-text-secondary"
                  )}
                >
                  <MessageSquare size={18} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm truncate">
                      {item.scenarios?.subject || "No Subject"}
                    </span>
                  )}
                  <TrashIcon
                    size={16}
                    className={cn(
                      "ml-auto text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100",
                      isCollapsed ? "hidden" : ""
                    )}
                    onClick={(e) => handleDeleteConversation(e, item.id)}
                  />
                </div>
              );
            })}
          </ScrollArea>
        </div>

        {/* Account settings */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => router.push("/account-settings")}
            className={cn(
              "justify-start gap-3 rounded-full text-primary hover:bg-gray-100 overflow-hidden w-full",
              isCollapsed ? "px-2" : "px-4"
            )}
          >
            <UserCog size={20} className="shrink-0" />
            {!isCollapsed && <span>Account settings</span>}
          </Button>
        </div>
      </aside>
    </Suspense>
  );
}