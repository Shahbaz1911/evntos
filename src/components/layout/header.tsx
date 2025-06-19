import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold font-headline hover:opacity-90 transition-opacity">
          EventWave
        </Link>
        <nav>
          <Button asChild variant="secondary">
            <Link href="/events/create">
              <CalendarPlus className="mr-2 h-5 w-5" />
              Create Event
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
