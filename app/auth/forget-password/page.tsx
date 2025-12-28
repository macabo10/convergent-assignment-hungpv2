"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const supabase = createClient();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // Go straight to the client page so the hash tokens are available to set the session
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            alert(error.message);
        } else {
            setMessage("Check your email for the reset link!");
        }
        setLoading(false);
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-blue px-4">
            <Card className="w-full max-w-md border-none shadow-xl rounded-[28px] p-4 bg-white">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-gemini-text-primary">
                        Forget Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
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

                        <Button
                            type="submit"
                            className="w-full rounded-full bg-gemini-blue hover:bg-blue-600 text-white py-6 text-base font-medium transition-all"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Get Reset Link"}
                        </Button>
                        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}