"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { LogOut, Save, Key, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AccountSettings() {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [user, setUser] = useState<any>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase
                    .from("users")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();
                if (profile) setFullName(profile.full_name || "");
            }
        }
        getUser();
    }, []);

    const handleUpdateProfile = async () => {
        setLoading(true);
        const { error } = await supabase
            .from("users")
            .update({ full_name: fullName })
            .eq("id", user.id);

        if (error) alert(error.message);
        else alert("Profile updated successfully!");
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all password fields.");
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

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });

        if (signInError) {
            alert("Incorrect current password.");
            setLoading(false);
            return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            alert(updateError.message);
        } else {
            alert("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return (
        <div className="flex-1 flex flex-col bg-background-blue p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full space-y-6 bg-background p-6 rounded-[24px]">
                <Link href="/" className="flex items-center gap-2 text-gemini-text-secondary hover:text-gemini-blue transition-colors mb-4">
                    <ArrowLeft size={18} /> <span>Back to Chat</span>
                </Link>

                {/* Profile Card */}
                {/* <Card className="border-none shadow-sm rounded-[24px] bg-sidebar">
                    <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">Full Name</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="rounded-full bg-input-bg mt-2 px-4 py-4 border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                            />
                        </div>
                        <Button onClick={handleUpdateProfile} disabled={loading} className="rounded-full bg-gemini-blue">
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />}
                            Save Changes
                        </Button>
                    </CardContent>
                </Card> */}

                {/* Security Card */}
                <Card className="border-none shadow-sm rounded-[24px] bg-sidebar">
                    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">Current Password</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="rounded-full bg-input-bg mt-1 px-4 py-4 border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">New Password</label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="rounded-full bg-input-bg mt-1 px-4 py-4 border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">Confirm New Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="rounded-full bg-input-bg mt-1 px-4 py-4 border border-gray-500 focus-visible:ring-1 focus-visible:ring-gemini-blue focus-visible:border-gemini-blue transition-all"
                            />
                        </div>
                        <Button onClick={handleChangePassword} variant="outline" disabled={loading} className="rounded-full border-gemini-blue text-gemini-blue mt-2">
                            <Key size={18} className="mr-2" /> Change Password
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex flex-col items-center gap-4 py-4">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <LogOut size={20} className="mr-2" />
                        Sign out
                    </Button>
                </div>
            </div>
        </div>
    );
}