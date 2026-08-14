"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { supabaseClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const handleAuth = async () => {
    setErrorMsg("");
    let response;
    const supabase = supabaseClient();
    if (isSignUp) {
      response = await supabase.auth.signUp({ email, password });
    } else {
      response = await supabase.auth.signInWithPassword({ email, password });
    }

    if (response.error) {
      setErrorMsg(response.error.message);
      return;
    }

    router.push("/get-post");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="email"
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            type="password"
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleAuth}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <button 
            type="button"
            className="text-xs text-muted-foreground hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

