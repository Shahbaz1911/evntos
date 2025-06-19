
"use client";

import type { Event, Registration } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateSeoFriendlyUrl } from '@/ai/flows/generate-seo-friendly-url';
import { useToast } from '@/hooks/use-toast';

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  addEvent: (newEventData: Pick<Event, 'title'>) => Promise<Event | null>;
  updateEvent: (updatedEvent: Event) => Promise<void>;
  deleteEvent: (eventId: string) => void;
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
  addRegistration: (newRegistrationData: Pick<Registration, 'eventId' | 'name' | 'email'>) => void;
  getRegistrationsByEventId: (eventId: string) => Registration[];
  isGeneratingSlug: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
      const storedRegistrations = localStorage.getItem('registrations');
      if (storedRegistrations) {
        setRegistrations(JSON.parse(storedRegistrations));
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('events', JSON.stringify(events));
    }
  }, [events, isInitialized]);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('registrations', JSON.stringify(registrations));
    }
  }, [registrations, isInitialized]);

  const addEvent = async (newEventData: Pick<Event, 'title'>): Promise<Event | null> => {
    setIsGeneratingSlug(true);
    try {
      const seoResult = await generateSeoFriendlyUrl({ title: newEventData.title });
      const newEvent: Event = {
        id: crypto.randomUUID(),
        ...newEventData,
        description: '',
        imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(newEventData.title)}`,
        mapLink: '',
        slug: seoResult.slug,
        registrationOpen: true,
        createdAt: new Date().toISOString(),
      };
      setEvents((prevEvents) => [newEvent, ...prevEvents]);
      setIsGeneratingSlug(false);
      return newEvent;
    } catch (error) {
      console.error("Error generating slug or creating event:", error);
      setIsGeneratingSlug(false);
      const fallbackSlug = newEventData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
       const newEvent: Event = {
        id: crypto.randomUUID(),
        ...newEventData,
        description: '',
        imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(newEventData.title)}`,
        mapLink: '',
        slug: fallbackSlug,
        registrationOpen: true,
        createdAt: new Date().toISOString(),
      };
      setEvents((prevEvents) => [newEvent, ...prevEvents]);
      return newEvent;
    }
  };

  const updateEvent = async (updatedEvent: Event) => {
    const originalEvent = events.find(e => e.id === updatedEvent.id);
    if (originalEvent && originalEvent.title !== updatedEvent.title) {
      setIsGeneratingSlug(true);
      try {
        const seoResult = await generateSeoFriendlyUrl({ title: updatedEvent.title });
        updatedEvent.slug = seoResult.slug;
      } catch (error) {
        console.error("Error regenerating slug:", error);
        updatedEvent.slug = updatedEvent.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
      }
      setIsGeneratingSlug(false);
    }
    
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const deleteEvent = (eventId: string) => {
    const eventToDelete = events.find(event => event.id === eventId);
    if (eventToDelete) {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      setRegistrations((prevRegistrations) => prevRegistrations.filter((reg) => reg.eventId !== eventId));
      toast({
        title: "Event Deleted",
        description: `"${eventToDelete.title}" and its registrations have been removed.`,
      });
    }
  };

  const getEventById = (id: string) => events.find((event) => event.id === id);
  const getEventBySlug = (slug: string) => events.find((event) => event.slug === slug);

  const addRegistration = (newRegistrationData: Pick<Registration, 'eventId' | 'name' | 'email'>) => {
    const newRegistration: Registration = {
      id: crypto.randomUUID(),
      ...newRegistrationData,
      registeredAt: new Date().toISOString(),
    };
    setRegistrations((prevRegistrations) => [newRegistration, ...prevRegistrations]);
    console.log(`Confirmation email sent to ${newRegistration.email} for event ${newRegistration.eventId}`);
  };

  const getRegistrationsByEventId = (eventId: string) =>
    registrations.filter((reg) => reg.eventId === eventId);

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventBySlug,
        addRegistration,
        getRegistrationsByEventId,
        isGeneratingSlug,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
