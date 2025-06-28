
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, UserCheck } from 'lucide-react';

export default function VerifiedGuestListPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
        <Button variant="outline" size="sm" asChild className="mb-6">
            <Link href={`/`}> 
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
            <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <CardTitle className="font-headline text-2xl">Verified Guests</CardTitle>
          <CardDescription>
            This feature has been disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-muted-foreground">Guest check-in functionality has been removed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
