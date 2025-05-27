"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useDevicePerformance } from "@/hooks/useDevicePerformance";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const isLowPerformance = useDevicePerformance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      toast.success("Password reset successfully!");
      router.push("/auth/login");
    } catch (error) {
      console.error(error)
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#0f0880] via-[#1a1a2e] to-[#16213e]">
        {/* Animated background elements */}
        {!isLowPerformance && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(isLowPerformance ? 10 : 15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10 will-change-transform"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: 'translateZ(0)',
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        )}

        {/* Glowing orbs */}
        {!isLowPerformance && (
          <>
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#e42627] opacity-20 blur-3xl will-change-transform"
              style={{ transform: 'translateZ(0)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#0f0880] opacity-20 blur-3xl will-change-transform"
              style={{ transform: 'translateZ(0)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}

        <div className="container relative flex h-screen w-screen flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
          >
            <Card className="border-none bg-white/10 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-center pb-2 font-bold">Invalid Reset Link</CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  The password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#0f0880] via-[#1a1a2e] to-[#16213e]">
      {/* Animated background elements */}
      {!isLowPerformance && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isLowPerformance ? 10 : 15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10 will-change-transform"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: 'translateZ(0)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Glowing orbs */}
      {!isLowPerformance && (
        <>
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#e42627] opacity-20 blur-3xl will-change-transform"
            style={{ transform: 'translateZ(0)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#0f0880] opacity-20 blur-3xl will-change-transform"
            style={{ transform: 'translateZ(0)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}

      <div className="container relative flex h-screen w-screen flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
              <p className="text-sm text-gray-300 mt-2">Enter your new password</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-none bg-white/10 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-center pb-2 font-bold">Reset Password</CardTitle>
                <CardDescription className="text-gray-300 text-center">Enter your new password below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">New Password</Label>
                    <motion.div
                      animate={{
                        scale: focusedField === 'password' ? 1.02 : 1,
                        boxShadow: focusedField === 'password' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                      }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300 pr-10"
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                    <motion.div
                      animate={{
                        scale: focusedField === 'confirmPassword' ? 1.02 : 1,
                        boxShadow: focusedField === 'confirmPassword' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                      }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300 pr-10"
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-11 bg-[#e42627] hover:bg-[#d41f20] text-white transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 