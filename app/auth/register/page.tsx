"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

const checkPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters long!");
        return false;
    }

    if (!/[A-Z]/.test(password)) {
        alert("Password must contain at least one uppercase letter!");
        return false;
    }

    if (!/[a-z]/.test(password)) {
        alert("Password must contain at least one lowercase letter!");
        return false;
    }

    if (!/[0-9]/.test(password)) {
        alert("Password must contain at least one number!");
        return false;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        alert("Password must contain at least one special character!");
        return false;
    }

    return true;
}

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (!checkPassword(password, confirmPassword)) {
            setLoading(false);
            return;
        }

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            alert("Registration successful!");
            router.push("/auth/login");
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background-blue px-4">
            <Card className="w-full max-w-md border-none shadow-xl rounded-[28px] p-4 bg-white">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-gemini-blue/10 rounded-full">
                            <UserPlus className="text-gemini-blue" size={24} />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gemini-text-primary">
                        Create an account
                    </CardTitle>
                    <CardDescription className="text-gemini-text-secondary">
                        Join the AI Persona Trainer to start your sessions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
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
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-gemini-text-secondary">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-gemini-blue hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}