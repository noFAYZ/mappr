"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Progress } from "@heroui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, CheckCircle2, Shield } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useUIStore } from "@/stores";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  return {
    score,
    checks,
    strength: score < 2 ? "weak" : score < 4 ? "medium" : "strong",
    percentage: (score / 5) * 100,
  };
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password");
  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Check for access token in URL
  useEffect(() => {
    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      addNotification({
        type: "error",
        title: "Invalid Reset Link",
        message: "This password reset link is invalid or has expired.",
      });
      router.push("/auth/signin");
    }
  }, [searchParams, router, addNotification]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        addNotification({
          type: "error",
          title: "Reset Failed",
          message: error.message,
        });

        return;
      }

      addNotification({
        type: "success",
        title: "Password Updated",
        message: "Your password has been successfully updated.",
      });

      router.push("/dashboard");
    } catch (error) {
      addNotification({
        type: "error",
        title: "Unexpected Error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10">
      <div className="w-full max-w-md">
        <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-2xl">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="text-center w-full">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Set new password</h1>
              <p className="text-default-500 mt-2">
                Enter your new password below
              </p>
            </div>
          </CardHeader>

          <CardBody className="px-8 pb-8">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Input
                  {...register("password")}
                  autoFocus
                  endContent={
                    <Button
                      isIconOnly
                      className="w-6 h-6 min-w-6"
                      size="sm"
                      variant="flat"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  }
                  errorMessage={errors.password?.message}
                  isInvalid={!!errors.password}
                  label="New Password"
                  placeholder="Enter your new password"
                  startContent={<Lock className="w-4 h-4 text-default-400" />}
                  type={showPassword ? "text" : "password"}
                  variant="bordered"
                />

                {/* Password Strength Indicator */}
                {passwordStrength && password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-600">
                        Password strength
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength.strength === "weak"
                            ? "text-danger"
                            : passwordStrength.strength === "medium"
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {passwordStrength.strength.charAt(0).toUpperCase() +
                          passwordStrength.strength.slice(1)}
                      </span>
                    </div>
                    <Progress
                      className="h-1"
                      color={
                        passwordStrength.strength === "weak"
                          ? "danger"
                          : passwordStrength.strength === "medium"
                            ? "warning"
                            : "success"
                      }
                      value={passwordStrength.percentage}
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(passwordStrength.checks).map(
                        ([key, passed]) => (
                          <div
                            key={key}
                            className={`flex items-center gap-1 ${passed ? "text-success" : "text-default-400"}`}
                          >
                            <CheckCircle2
                              className={`w-3 h-3 ${passed ? "text-success" : "text-default-300"}`}
                            />
                            {key === "length" && "8+ characters"}
                            {key === "lowercase" && "Lowercase"}
                            {key === "uppercase" && "Uppercase"}
                            {key === "numbers" && "Numbers"}
                            {key === "symbols" && "Symbols"}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Input
                {...register("confirmPassword")}
                endContent={
                  <Button
                    isIconOnly
                    className="w-6 h-6 min-w-6"
                    size="sm"
                    variant="flat"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                }
                errorMessage={errors.confirmPassword?.message}
                isInvalid={!!errors.confirmPassword}
                label="Confirm New Password"
                placeholder="Confirm your new password"
                startContent={<Lock className="w-4 h-4 text-default-400" />}
                type={showConfirmPassword ? "text" : "password"}
                variant="bordered"
              />

              <Button
                className="w-full font-semibold"
                color="primary"
                isDisabled={!isValid}
                isLoading={isLoading}
                size="lg"
                type="submit"
              >
                Update Password
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-success-700">
                  <strong>Security tip:</strong> Use a unique password that you
                  don't use for other accounts. Consider using a password
                  manager.
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
