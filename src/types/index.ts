
export interface Event {
  id: string;
  userId: string; // ID of the user who created the event
  title: string;
  description: string;
  imageUrl: string;
  mapLink: string;
  venueName?: string; // Optional venue name
  venueAddress?: string; // Optional venue address
  slug: string;
  registrationOpen: boolean;
  createdAt: string; // ISO date string
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:MM
}

export interface Registration {
  id: string;
  eventId: string;
  eventOwnerId: string; // ID of the user who owns the event
  name: string;
  email: string;
  contactNumber?: string; // Optional contact number
  registeredAt: string; // ISO date string
  source?: 'form' | 'shared_link'; // To track how the registration was created
  checkedIn?: boolean;
  checkedInAt?: string; // ISO date string, time of check-in
}
