'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  userCode: z.string().optional(),
  profession: z.string().optional(),
  role: z.enum(['user', 'client']),
  phone: z.string().optional(),
}).refine((data) => {
  if (data.role === 'user') {
    return !!data.profession;
  }
  return true;
}, {
  message: "Profession is required for users",
  path: ["profession"]
}).refine((data) => {
  if (data.role === 'client') {
    return !!data.userCode;
  }
  return true;
}, {
  message: "User code is required for clients",
  path: ["userCode"]
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'user' | 'client'>('user');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Registration successful!');
      router.push('/en/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-y-auto bg-gradient-to-br from-[#0f0880] via-[#1a1a2e] to-[#16213e]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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

      {/* Glowing orbs */}
      <motion.div
        className="fixed -top-40 -right-40 w-80 h-80 rounded-full bg-[#e42627] opacity-20 blur-3xl pointer-events-none"
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
        className="fixed -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#0f0880] opacity-20 blur-3xl pointer-events-none"
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

      <div className="container relative min-h-screen py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] my-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">Create an account</h1>
              <p className="text-sm text-gray-300 mt-2">Choose your role and fill in the details</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-none bg-white/10 backdrop-blur-lg shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-center pb-2 font-bold">Registration</CardTitle>
                <CardDescription className="text-gray-300 text-center">Fill in your details to create an account</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="user" className="w-full" onValueChange={(value) => {
                  const role = value === 'user' ? 'user' : 'client';
                  setActiveRole(role);
                  setValue('role', role);
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10">
                    <TabsTrigger value="user" className="data-[state=active]:bg-[#e42627] data-[state=active]:text-white">
                      User
                    </TabsTrigger>
                    <TabsTrigger value="client" className="data-[state=active]:bg-[#e42627] data-[state=active]:text-white">
                      Client
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {activeRole === 'user' && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full h-11 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => {
                            window.location.href = '/api/auth/google';
                          }}
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
                            <span className="bg-white/10 px-2 text-gray-300">Or continue with</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <motion.div
                        animate={{
                          scale: focusedField === 'name' ? 1.02 : 1,
                          boxShadow: focusedField === 'name' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          {...register('name')}
                          className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300"
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </motion.div>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-400"
                          >
                            {errors.name.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

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
                        className="relative"
                      >
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register('password')}
                          className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300 pr-10"
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
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
                          {...register('confirmPassword')}
                          className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300 pr-10"
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
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
                      <AnimatePresence>
                        {errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-red-400"
                          >
                            {errors.confirmPassword.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {activeRole === 'user' && (
                      <div className="space-y-2">
                        <Label htmlFor="profession" className="text-white">Profession</Label>
                        <motion.div
                          animate={{
                            scale: focusedField === 'profession' ? 1.02 : 1,
                            boxShadow: focusedField === 'profession' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="profession"
                            type="text"
                            placeholder="e.g. Personal Trainer"
                            {...register('profession')}
                            className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300"
                            onFocus={() => setFocusedField('profession')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.profession && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm text-red-400"
                            >
                              {errors.profession.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {activeRole === 'client' && (
                      <div className="space-y-2">
                        <Label htmlFor="userCode" className="text-white">User Code</Label>
                        <motion.div
                          animate={{
                            scale: focusedField === 'userCode' ? 1.02 : 1,
                            boxShadow: focusedField === 'userCode' ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="userCode"
                            type="text"
                            placeholder="Enter your trainer's code"
                            {...register('userCode')}
                            className="h-11 px-4 bg-white/10 border-white/20 text-white placeholder:text-gray-400 transition-all duration-300"
                            onFocus={() => setFocusedField('userCode')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {errors.userCode && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm text-red-400"
                            >
                              {errors.userCode.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#e42627] hover:bg-[#d41f20] text-white transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating account...' : 'Create account'}
                      </Button>
                    </motion.div>
                  </form>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-gray-300 text-center">
                  Already have an account?{' '}
                  <Link href="/en/auth/login" className="text-[#e42627] hover:text-[#d41f20] font-medium transition-colors duration-300">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 