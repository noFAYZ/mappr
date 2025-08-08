"use client";

import { useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <Button
          as={NextLink}
          className="mb-6"
          href="/"
          startContent={<ArrowLeft className="w-4 h-4" />}
          variant="flat"
        >
          Back to Home
        </Button>

        <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-2xl">
          <CardHeader className="pb-6 pt-8 px-8">
            <div className="text-center w-full">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-default-500 mt-2">
                Sign in to your MoneyMappr account
              </p>
            </div>
          </CardHeader>

          <CardBody className="px-8 pb-8">
            <Auth
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "rgb(14 165 233)",
                      brandAccent: "rgb(2 132 199)",
                    },
                  },
                },
                className: {
                  container: "w-full",
                  button:
                    "w-full bg-primary hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition-colors",
                  input:
                    "w-full p-3 border border-default-300 rounded-2xl mb-4 bg-background",
                  message:
                    "text-sm text-danger mb-4 p-3 bg-danger-50 border border-danger-200 rounded-xl",
                  divider: "my-6",
                  label: "text-sm font-medium text-foreground mb-2 block",
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: "Email Address",
                    password_label: "Password",
                    button_label: "Sign In",
                    loading_button_label: "Signing In...",
                    social_provider_text: "Sign in with {{provider}}",
                    link_text: "Don't have an account? Sign up",
                  },
                  sign_up: {
                    email_label: "Email Address",
                    password_label: "Password",
                    button_label: "Create Account",
                    loading_button_label: "Creating Account...",
                    social_provider_text: "Sign up with {{provider}}",
                    link_text: "Already have an account? Sign in",
                  },
                },
              }}
              onlyThirdPartyProviders={false}
              providers={["google", "github"]}
              redirectTo={`${window.location.origin}/auth/callback`}
              showLinks={true}
              supabaseClient={supabase}
              theme={theme as any}
            />

            <div className="mt-6 text-center">
              <p className="text-xs text-default-400">
                By signing in, you agree to our{" "}
                <Link href="/terms" size="sm">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" size="sm">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
