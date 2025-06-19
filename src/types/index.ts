
export interface Event {
  id: string;
  userId: string; // ID of the user who created the event
  title: string;
  description: string;
  imageUrl: string;
  mapLink: string;
  slug: string;
  registrationOpen: boolean;
  createdAt: string; // ISO date string
  eventDate: string; // YYYY-MM-DD
  eventTime: string; // HH:MM
}

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  registeredAt: string; // ISO date string
  source?: 'form' | 'shared_link'; // To track how the registration was created
}
