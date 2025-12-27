"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-blue px-4">
            <Card className="w-full max-w-md border-none shadow-xl rounded-[28px] p-4 bg-white">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-gemini-text-primary">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-gemini-text-secondary">
                        Enter your credentials to access your ai persona
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                required
                                className="rounded-full bg-input-bg border-none px-5 py-6 focus-visible:ring-1 focus-visible:ring-gemini-blue"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                required
                                className="rounded-full bg-input-bg border-none px-5 py-6 focus-visible:ring-1 focus-visible:ring-gemini-blue"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className=" text-right text-sm text-gemini-text-secondary">
                                <a href="/auth/forget-password" className="text-gemini-blue hover:underline font-medium">
                                    Forget password?
                                </a>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full rounded-full bg-gemini-blue hover:bg-blue-600 text-white py-6 text-base font-medium transition-all"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-4 mb-2 text-center text-sm text-gemini-text-secondary">
                        Do not have an account?{" "}
                        <a href="/auth/register" className="text-gemini-blue hover:underline font-medium">
                            Create one for free
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}