
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/loading-spinner';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M17.6402 9.20455C17.6402 8.56818 17.5818 7.95455 17.4764 7.36364H9V10.8409H13.8409C13.6364 11.9659 13.0091 12.9182 12.0682 13.5227V15.7045H14.9455C16.6364 14.1591 17.6402 11.9182 17.6402 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.4318 18 13.5091 17.1818 14.9455 15.7045L12.0682 13.5227C11.2614 14.0568 10.2273 14.375 9 14.375C6.70455 14.375 4.75227 12.8977 4.02273 10.9773H1.05V13.1932C2.49545 15.9909 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M4.02273 10.9773C3.84545 10.4659 3.75 9.93182 3.75 9.375C3.75 8.81818 3.84545 8.28409 4.01364 7.77273V5.55682H1.05C0.375 6.75 0 8.01136 0 9.375C0 10.7386 0.375 11.9909 1.05 13.1932L4.02273 10.9773Z" fill="#FBBC05"/>
    <path d="M9 3.625C10.3318 3.625 11.3364 4.14773 11.8227 4.60227L14.4773 2.06818C13.0682 0.795455 11.1364 0 9 0C5.48182 0 2.49545 2.00909 1.05 4.80682L4.01364 7.02273C4.75227 5.10227 6.70455 3.625 9 3.625Z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { logIn, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard'); 
    }
  }, [user, authLoading, router]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await logIn(data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      // AuthContext will handle redirect
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Signed in with Google",
        description: "Welcome! Redirecting to dashboard...",
      });
      // AuthContext will handle redirect
    } catch (error: any) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };
  
  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))] py-12 container px-4">
      <Card className="w-full max-w-md shadow-xl border border-border">
        <CardHeader className="text-center">
           <Link href="/" className="mx-auto mb-4">
             <span className="text-4xl font-bold text-primary font-headline">eventos</span>
          </Link>
          <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
          <CardDescription>Log in to manage your events.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting || isGoogleSubmitting}>
              {isSubmitting && <LoadingSpinner size={16} className="mr-2" />}
              {isSubmitting ? "Logging In..." : "Log In"}
            </Button>
            <div className="relative my-2 w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
              {isGoogleSubmitting ? <LoadingSpinner size={16} className="mr-2" /> : <GoogleIcon />}
              {isGoogleSubmitting ? "Signing in..." : "Sign in with Google"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link href="/signup">Sign up</Link>
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
