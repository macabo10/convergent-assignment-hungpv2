"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextareaAutosize from "react-textarea-autosize"; import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Message } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Persona, Scenario } from "@/types";

const traits: { label: string; key: keyof Persona }[] = [
  { label: "Openness", key: "o_score" },
  { label: "Conscientiousness", key: "c_score" },
  { label: "Extraversion", key: "e_score" },
  { label: "Agreeableness", key: "a_score" },
  { label: "Neuroticism", key: "n_score" },
];

const Header = ({
  title,
  personaData,
  onUpdatePersona
}: {
  title: string,
  personaData: Persona | null,
  onUpdatePersona: (data: Persona) => Promise<boolean>
}) => {
  const defaultPersona: Persona = {
    name: "",
    role: "Mentor",
    tone: "Professional",
    o_score: 50,
    c_score: 50,
    e_score: 50,
    a_score: 50,
    n_score: 50
  } as Persona;

  const [localPersona, setLocalPersona] = useState<Persona>(personaData || defaultPersona);
  const [open, setOpen] = useState(false);

  const handleUpdate = async () => {
    const success = await onUpdatePersona(localPersona);
    if (success) {
      setOpen(false);
    } else {
      alert("Failed to update persona. Please try again.");
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-background/80 backdrop-blur-md z-20">
      <h2 className="text-md font-medium truncate">{title}</h2>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Info size={30} className="text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md rounded-[28px] bg-white">
          <DialogHeader>
            <DialogTitle>Adjust AI Persona</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold opacity-50">Name</label>
              <Input
                className="border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                value={localPersona.name}
                onChange={(e) => setLocalPersona({ ...localPersona, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold opacity-50">Role</label>
              <Input
                className="border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                value={localPersona.role}
                onChange={(e) => setLocalPersona({ ...localPersona, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold opacity-50">Tone</label>
              <Input
                className="border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                value={localPersona.tone}
                onChange={(e) => setLocalPersona({ ...localPersona, tone: e.target.value })}
              />
            </div>
            {traits.map((trait) => (
              <div key={trait.key} className="space-y-2">
                <div className="flex justify-between text-xs capitalize">
                  <span>{trait.label}</span>
                  <span className="text-gemini-blue">{localPersona[trait.key] as number}</span>
                </div>
                <Slider
                  // className="focus-visible:ring-gemini-blue focus-visible:border-gemini-blue"
                  value={[localPersona[trait.key] as number || 50]}
                  max={100}
                  step={1}
                  onValueChange={(val) => setLocalPersona({ ...localPersona, [trait.key]: val[0] })}
                />
              </div>
            ))}
            <Button
              className="w-full rounded-full bg-gemini-blue text-white mt-4"
              onClick={() => handleUpdate()}
            >
              Update Persona
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

const MessageItem = ({ isUser, content }: { isUser: boolean, content: string }) => {
  return (
    <div className={cn(
      "flex gap-4 items-start",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-sm",
        isUser ? "bg-purple-600 text-white" : "bg-gemini-blue text-white"
      )}>
        {isUser ? "U" : "AI"}
      </div>

      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "leading-relaxed px-4 py-2.5 text-sm md:text-base shadow-sm border",
          isUser
            ? "bg-primary text-primary-foreground border-primary rounded-2xl rounded-tr-none"
            : "bg-sidebar text-foreground border-border rounded-2xl rounded-tl-none"
        )}>
          {content}
        </div>
      </div>
    </div>
  )
}

const InputArea = ({
  inputValue,
  setInputValue,
  onSend,
  isWaitingForAI
}: {
  inputValue: string,
  setInputValue: React.Dispatch<React.SetStateAction<string>>,
  onSend: (content: string) => void,
  isWaitingForAI: boolean
}) => {
  console.log("isWaitingForAI:", isWaitingForAI);
  return (
    <div className="w-full shrink-0 bg-background pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-end bg-input-bg rounded-[28px] 
          p-2 focus-within:shadow-md transition-all border border-transparent focus-within:border-border/50">
          <div className="w-full flex items-end px-2">
            <TextareaAutosize
              minRows={1}
              maxRows={3}
              value={inputValue}
              disabled={isWaitingForAI}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isWaitingForAI ? "AI is thinking..." : "Ask agent..."}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-base outline-none 
                resize-none overflow-y-auto"
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) {
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey && !isWaitingForAI && inputValue.trim()) {
                  e.preventDefault();
                  onSend(inputValue);
                  setInputValue("");
                }
              }}
            />
            <div className="pb-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full transition-colors",
                  inputValue ? "text-gemini-blue hover:bg-gemini-blue/10" : "text-muted-foreground opacity-50"
                )}
                disabled={!inputValue.trim() || isWaitingForAI}
                onClick={() => {
                  onSend(inputValue);
                  setInputValue("");
                }}
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  const [messages, setMessages] = useState<Message[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const channelRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setPersona(null);
      setScenario(null);
      setMessages([]);
      return;
    }

    const fetchInitialData = async () => {
      const { data: convData } = await supabase
        .from("conversations")
        .select("*, personas (*), scenarios (*)")
        .eq("id", conversationId)
        .single();

      if (convData?.personas) setPersona(convData.personas);
      if (convData?.scenarios) setScenario(convData.scenarios);
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs);
    };

    fetchInitialData();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    // Cleanup existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, supabase]);

  const handleUpdatePersona = async (updatedPersona: Persona): Promise<boolean> => {
    if (!updatedPersona.id) return false;

    const { error } = await supabase
      .from("personas")
      .update(updatedPersona)
      .eq("id", updatedPersona.id);

    if (error) {
      console.error("Error updating persona:", error);
      return false;
    }

    setPersona(updatedPersona);
    return true;
  };

  const displayMessages = conversationId ? messages : [];

  const handleSendMessage = async (content: string) => {
    console.log("Sending message:", content);
    if (!content.trim() || !user) return;

    let targetId = conversationId;
    try {
      if (!targetId) {
        const { data: randomPersona, error: pError } = await supabase
          .from("personas")
          .select("id")
          .limit(10);

        if (pError || !randomPersona.length) {
          console.error("Error fetching personas:", pError);
          return;
        }
        const pickedPersona = randomPersona[Math.floor(Math.random() * randomPersona.length)];

        const { data: randomScenario, error: sError } = await supabase
          .from("scenarios")
          .select("id")
          .limit(10);

        if (sError || !randomScenario.length) {
          console.error("Error fetching scenarios:", sError);
          return;
        }
        const pickedScenario = randomScenario[Math.floor(Math.random() * randomScenario.length)];

        const { data: newConv, error: convError } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            persona_id: pickedPersona.id,
            scenario_id: pickedScenario.id,
            status: "active"
          })
          .select()
          .single();

        if (convError || !newConv) {
          throw convError;
        }

        targetId = newConv.id;
        router.push(`/?id=${targetId}`);
      }

      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: targetId,
        content: content,
        sender_type: "user",
      });

      if (msgError) throw msgError;
      setInputValue("");

    } catch (error) {
      console.error("Critical error:", error);
      alert("Failed to start simulation.");
    }
  };

  const lastMessage = messages[messages.length - 1];
  const isWaitingForAI = lastMessage?.sender_type === "user";

  return (
    <Suspense fallback={<div>Loading Chat...</div>}>
      <div className="flex flex-col h-screen bg-background overflow-hidden">

        <Header
          key={persona?.id}
          title={conversationId ? persona?.name + ": " + (scenario?.subject || "") : "New Conversation"}
          personaData={persona}
          onUpdatePersona={handleUpdatePersona}
        />

        {/* Messages */}
        <ScrollArea className="flex-1 w-full overflow-y-auto">
          <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            {displayMessages.map((msg, index) => {
              const isUser = msg.sender_type === "user";
              return <MessageItem
                key={msg.id}
                isUser={isUser}
                content={msg.content}
              />;
            })}
          </div>
        </ScrollArea>

        <InputArea inputValue={inputValue} setInputValue={setInputValue} onSend={handleSendMessage} isWaitingForAI={isWaitingForAI} />
      </div>
    </Suspense>
  );
}