'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { PageTransition } from '@/components/ui/page-transition';
import { useNavigationLoading } from '@/hooks/use-navigation-loading';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isLowPerformance = useDevicePerformance();
  const isNavigating = useNavigationLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/en/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Login successful!');
      router.push('/en/dashboard');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <PageTransition isLoading={isLoading || isNavigating}>
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
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                <p className="text-sm text-gray-300 mt-2">Sign in to your account</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-none bg-white/10 backdrop-blur-lg shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white text-center pb-2 font-bold">Login</CardTitle>
                  <CardDescription className="text-gray-300 text-center">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full h-11 mb-4 bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => signIn('google', { callbackUrl: '/en/dashboard' })}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-transparent px-2 text-gray-300">Or continue with</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <motion.div
                        animate={{
                          scale: focusedField === 'email' ? 1.02 : 1,
                          boxShadow: focusedField === 'email' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          autoComplete="email"
                          {...register('email')}
                          className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300"
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </motion.div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-400"
                          >
                            {errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Password</Label>
                      <motion.div
                        animate={{
                          scale: focusedField === 'password' ? 1.02 : 1,
                          boxShadow: focusedField === 'password' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          {...register('password')}
                          className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300"
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </motion.div>
                      <div className="flex justify-end">
                        <Link
                          href="/auth/forgot-password"
                          className="text-sm text-[#e42627] hover:text-[#d41f20] transition-colors duration-300"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <AnimatePresence>
                        {errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-400"
                          >
                            {errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
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
                        {isLoading ? 'Signing in...' : 'Sign in'}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-gray-300 text-center">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="text-[#e42627] hover:text-[#d41f20] font-medium transition-colors duration-300">
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
} 