
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { CreditCard, CalendarDays, Lock, DollarSign, Star, Zap } from 'lucide-react';

// Pricing data, should be kept in sync with pricing-section.tsx
const pricingTiers = [
  { name: "Pro", id: "pro", price: "$29", frequency: "/month" },
  { name: "Business", id: "business", price: "$79", frequency: "/month" },
];

const DUMMY_CARD_NUMBER = "123456784567";
const DUMMY_EXPIRY_DATE = "01/01";
const DUMMY_CVC = "123";

const checkoutSchema = z.object({
  cardNumber: z.string().refine(val => val === DUMMY_CARD_NUMBER, {
    message: "Invalid card number. Use the dummy number.",
  }),
  expiryDate: z.string().refine(val => val === DUMMY_EXPIRY_DATE, {
    message: "Invalid expiry date. Use MM/YY format (dummy: 01/01).",
  }),
  cvc: z.string().refine(val => val === DUMMY_CVC, {
    message: "Invalid CVC. Use the dummy CVC.",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { planName: rawPlanName } = params;
  const planName = Array.isArray(rawPlanName) ? rawPlanName[0] : rawPlanName;

  const { user, loading: authLoading, userSubscriptionStatus, activateUserSubscription, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { cardNumber: '', expiryDate: '', cvc: '' }
  });
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast({ title: "Login Required", description: "Please log in to proceed with checkout." });
        router.push('/login');
      } else if (userSubscriptionStatus !== 'none' && userSubscriptionStatus !== 'loading' && !isAdmin) {
        toast({ title: "Already Subscribed", description: "You already have an active plan." });
        router.push('/dashboard');
      } else if (isAdmin) {
         router.push('/dashboard');
      }
    }
  }, [user, authLoading, userSubscriptionStatus, isAdmin, router, toast]);

  const onSubmit: SubmitHandler<CheckoutFormValues> = async (data) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (planName) {
      activateUserSubscription(planName);
    } else {
      toast({ title: "Error", description: "Plan details missing. Cannot activate.", variant: "destructive"});
      router.push('/pricing');
      setIsSubmitting(false);
    }
  };

  const displayPlanName = planName ? decodeURIComponent(planName) : "Selected";
  const currentPlan = pricingTiers.find(p => p.name.toLowerCase() === displayPlanName.toLowerCase());

  if (authLoading || userSubscriptionStatus === 'loading' || (userSubscriptionStatus !== 'none' && !isAdmin)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  if (!user || isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        <p className="text-muted-foreground">Redirecting...</p>
        <LoadingSpinner size={32} className="ml-2"/>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))] py-12 container px-4">
      <Card className="w-full max-w-lg shadow-xl border border-border">
        <CardHeader className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="font-headline text-3xl">Secure Checkout</CardTitle>
          <CardDescription>
            You are purchasing the <span className="font-semibold text-primary">{displayPlanName} Plan</span> for <span className="font-semibold text-primary">{currentPlan?.price || '...'}</span> per month.
            <br/> Please enter dummy payment details to proceed.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                Card Number
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder={DUMMY_CARD_NUMBER}
                {...register("cardNumber")}
                className={errors.cardNumber ? "border-destructive" : ""}
                aria-invalid={errors.cardNumber ? "true" : "false"}
              />
              {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                  Expiry Date (MM/YY)
                </Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder={DUMMY_EXPIRY_DATE}
                  {...register("expiryDate")}
                  className={errors.expiryDate ? "border-destructive" : ""}
                  aria-invalid={errors.expiryDate ? "true" : "false"}
                />
                {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc" className="flex items-center">
                  <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  CVC
                </Label>
                <Input
                  id="cvc"
                  type="text"
                  placeholder={DUMMY_CVC}
                  {...register("cvc")}
                  className={errors.cvc ? "border-destructive" : ""}
                  aria-invalid={errors.cvc ? "true" : "false"}
                />
                {errors.cvc && <p className="text-sm text-destructive">{errors.cvc.message}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-6" disabled={isSubmitting || authLoading}>
              {isSubmitting && <LoadingSpinner size={20} className="mr-2" />}
              {isSubmitting ? "Processing Payment..." : `Pay ${currentPlan?.price || ''} and Activate ${displayPlanName} Plan`}
            </Button>
            <Button variant="link" onClick={() => router.push('/pricing')} className="text-muted-foreground">
              Cancel and return to pricing
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
