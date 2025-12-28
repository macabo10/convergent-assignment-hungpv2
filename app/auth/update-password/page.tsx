"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sessionReady, setSessionReady] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        let active = true;

        const establishSession = async () => {
            try {
                const code = searchParams.get("code");
                if (code) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData.session && active) setSessionReady(true);
                    else if (active) setError("Recovery session not found. Please open the reset link from your email again.");
                    return;
                }

                const hashString = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
                const hashParams = new URLSearchParams(hashString);
                const access_token = hashParams.get("access_token");
                const refresh_token = hashParams.get("refresh_token");

                if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
                    if (error) throw error;
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData.session && active) setSessionReady(true);
                    else if (active) setError("Recovery session not found. Please open the reset link from your email again.");
                    return;
                }

                // Fallback: see if a session already exists (e.g., came via callback route).
                const { data } = await supabase.auth.getSession();
                if (data.session && active) {
                    setSessionReady(true);
                    return;
                }

                if (active) {
                    setError("Recovery session not found. Please open the reset link from your email again.");
                }
            } catch (_err) {
                if (active) {
                    setError("Invalid or expired recovery link. Please request a new one.");
                }
            }
        };

        establishSession();

        return () => {
            active = false;
        };
    }, [searchParams, supabase]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!sessionReady) {
            setError("Recovery session missing. Please reopen the reset link from your email.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long!");
            return false;
        }

        if (!/[A-Z]/.test(newPassword)) {
            alert("Password must contain at least one uppercase letter!");
            return false;
        }

        if (!/[a-z]/.test(newPassword)) {
            alert("Password must contain at least one lowercase letter!");
            return false;
        }

        if (!/[0-9]/.test(newPassword)) {
            alert("Password must contain at least one number!");
            return false;
        }

        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            alert("Password must contain at least one special character!");
            return false;
        }

        setLoading(true);

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
            setLoading(false);
            setError("Recovery session expired. Please use the reset link again.");
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            alert("Update successful!");
            router.push("/auth/login");
        }
        setLoading(false);
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-blue px-4">
            <Card className="w-full max-w-md border-none shadow-xl rounded-[28px] p-4 bg-white">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-gemini-text-primary">
                        Update Password
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                required
                                className="rounded-full bg-input-bg border-none px-5 py-6 focus-visible:ring-1 focus-visible:ring-gemini-blue"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-sm text-gemini-text-secondary mt-1 px-1">
                                Password must:
                                <br />- Be at least 8 characters long
                                <br />- Include an uppercase letter
                                <br />- Include a lowercase letter
                                <br />- Include a number
                                <br />- Include a special character
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                required
                                className="rounded-full bg-input-bg border-none px-5 py-6 focus-visible:ring-1 focus-visible:ring-gemini-blue"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full rounded-full bg-gemini-blue hover:bg-blue-600 text-white py-6 text-base font-medium transition-all mt-2"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Password"}
                        </Button>
                    </form>
                    {error && <p className="text-red-600 text-sm text-center mt-2">{error}</p>}
                </CardContent>
            </Card>
        </div>
    );
}