"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { checkPasswordStrength } from "@/lib/utils";

export default function UpdatePasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!checkPasswordStrength(newPassword, confirmPassword)) {
            return;
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