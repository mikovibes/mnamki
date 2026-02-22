"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleAuth = async (isSignUp: boolean) => {
        setLoading(true);
        setError("");

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;
                alert("Sign up successful! Please check your email for confirmation, or try logging in.");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;

                // Force a hard navigation to clear any client-side cache
                window.location.href = "/";
            }
        } catch (e: any) {
            console.error("Auth error:", e);
            setError(e.message || "An error occurred during authentication.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <Card className="w-full max-w-sm border-border shadow-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Manamki</CardTitle>
                    <CardDescription>Our healthy recipes, made smarter.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                            onKeyDown={e => e.key === 'Enter' && handleAuth(false)}
                        />
                    </div>
                    <div className="flex gap-3 pt-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl shadow-sm font-semibold"
                            disabled={loading || !email || !password}
                            onClick={() => handleAuth(true)}
                        >
                            Sign Up
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
                            disabled={loading || !email || !password}
                            onClick={() => handleAuth(false)}
                        >
                            {loading ? "..." : "Log In"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
