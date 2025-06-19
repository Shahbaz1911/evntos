
import type { Registration } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, UserCircle, Phone, CheckCircle } from 'lucide-react';

interface VerifiedGuestListItemProps {
  registration: Registration;
}

export default function VerifiedGuestListItem({ registration }: VerifiedGuestListItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow bg-green-50 border-green-200">
      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-grow space-y-1">
          <div className="flex items-center font-semibold text-primary">
            <UserCircle className="mr-2 h-5 w-5" />
            <p className="truncate">{registration.name}</p>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" />
            <a href={`mailto:${registration.email}`} className="truncate hover:underline">{registration.email}</a>
          </div>
          {registration.contactNumber && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-2 h-4 w-4" />
              <p className="truncate">{registration.contactNumber}</p>
            </div>
          )}
        </div>
        <div className="text-xs text-green-700 whitespace-nowrap pt-2 sm:pt-0">
          <div className="flex items-center">
            <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
            <span>Checked In: {registration.checkedInAt ? new Date(registration.checkedInAt).toLocaleString() : 'N/A'}</span>
          </div>
           <div className="text-muted-foreground mt-1">
            Registered: {new Date(registration.registeredAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
