
"use client";

import type { Event, Registration } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { generateSeoFriendlyUrl } from '@/ai/flows/generate-seo-friendly-url';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  contextLoading: boolean;
  isGeneratingSlug: boolean;
  addEvent: (newEventData: Pick<Event, 'title'>) => Promise<Event | null>;
  updateEvent: (updatedEvent: Event) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
  addRegistration: (newRegistrationData: Pick<Registration, 'eventId' | 'name' | 'email' | 'contactNumber'>) => Promise<Registration | null>;
  recordSharedLinkVisit: (eventId: string, eventSlug: string) => Promise<void>;
  getRegistrationsByEventId: (eventId: string) => Registration[];
  getRegistrationByIdFromFirestore: (registrationId: string) => Promise<Registration | null>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [contextLoading, setContextLoading] = useState(true);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchData = useCallback(async () => {
    if (authLoading) {
      setContextLoading(true);
      return;
    }

    setContextLoading(true);
    try {
      const eventsCol = collection(db, 'events');
      const eventSnapshot = await getDocs(eventsCol);
      const eventsList = eventSnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          mapLink: data.mapLink,
          slug: data.slug,
          registrationOpen: data.registrationOpen,
          createdAt: data.createdAt,
          eventDate: data.eventDate,
          eventTime: data.eventTime,
        } as Event;
      });
      setEvents(eventsList);

      if (authUser) {
        const regsCol = collection(db, 'registrations');
        const regSnapshot = await getDocs(regsCol);
        const regsList = regSnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            eventId: data.eventId,
            name: data.name,
            email: data.email,
            contactNumber: data.contactNumber,
            registeredAt: data.registeredAt,
            source: data.source,
            checkedIn: data.checkedIn || false,
            checkedInAt: data.checkedInAt,
          } as Registration;
        });
        setRegistrations(regsList);
      } else {
        setRegistrations([]);
      }

    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      const firebaseError = error as import('firebase/app').FirebaseError;
      if (firebaseError.code === 'permission-denied') {
          toast({ title: "Permissions Error", description: "Could not load some data due to access restrictions.", variant: "destructive" });
      } else {
          toast({ title: "Data Load Error", description: "Could not load data from the cloud.", variant: "destructive" });
      }
    } finally {
      setContextLoading(false);
    }
  }, [authUser, authLoading, toast]);

  useEffect(() => {
    if (!authLoading) { // Only fetch if auth state is determined
        fetchData();
    }
  }, [authLoading, fetchData]);


  const addEvent = useCallback(async (newEventData: Pick<Event, 'title'>): Promise<Event | null> => {
    if (!authUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to create an event.", variant: "destructive" });
      return null;
    }
    setIsGeneratingSlug(true);
    try {
      const seoResult = await generateSeoFriendlyUrl({ title: newEventData.title });
      
      const eventDraft: Omit<Event, 'id' | 'slug'> = {
        userId: authUser.uid,
        title: newEventData.title,
        description: '',
        imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(newEventData.title)}`,
        mapLink: '',
        eventDate: '',
        eventTime: '',
        registrationOpen: true,
        createdAt: new Date().toISOString(),
      };
      
      const eventToSave = { ...eventDraft, slug: seoResult.slug };
      const docRef = await addDoc(collection(db, "events"), eventToSave);
      const newEventWithId: Event = { ...eventToSave, id: docRef.id };
      
      setEvents((prevEvents) => [newEventWithId, ...prevEvents]);
      setIsGeneratingSlug(false);
      return newEventWithId;

    } catch (error) {
      console.error("Error creating event:", error);
      toast({ title: "Error", description: "Could not create event.", variant: "destructive" });
      setIsGeneratingSlug(false);
      const fallbackSlug = newEventData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
      const eventDraft: Omit<Event, 'id' | 'slug'> = {
        userId: authUser.uid,
        title: newEventData.title,
        description: '',
        imageUrl: `https://placehold.co/600x400.png?text=${encodeURIComponent(newEventData.title)}`,
        mapLink: '',
        eventDate: '',
        eventTime: '',
        registrationOpen: true,
        createdAt: new Date().toISOString(),
      };
      const eventToSave = { ...eventDraft, slug: fallbackSlug };
      try {
        const docRef = await addDoc(collection(db, "events"), eventToSave);
        const newEventWithId: Event = { ...eventToSave, id: docRef.id };
        setEvents((prevEvents) => [newEventWithId, ...prevEvents]);
        return newEventWithId;
      } catch (dbError) {
         console.error("Error saving event with fallback slug:", dbError);
         toast({ title: "Error", description: "Could not create event even with fallback.", variant: "destructive" });
         return null;
      }
    }
  }, [authUser, toast]);

  const updateEvent = useCallback(async (updatedEventData: Event) => {
    if (!authUser || authUser.uid !== updatedEventData.userId) {
      toast({ title: "Authorization Error", description: "You are not authorized to update this event.", variant: "destructive" });
      return;
    }
    
    let slugToUse = updatedEventData.slug;
    const originalEvent = events.find(e => e.id === updatedEventData.id);

    if (originalEvent && originalEvent.title !== updatedEventData.title) {
      setIsGeneratingSlug(true);
      try {
        const seoResult = await generateSeoFriendlyUrl({ title: updatedEventData.title });
        slugToUse = seoResult.slug;
      } catch (error) {
        console.error("Error regenerating slug during update:", error);
        slugToUse = updatedEventData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
      }
      setIsGeneratingSlug(false);
    }
    
    const finalUpdatedEvent = { ...updatedEventData, slug: slugToUse };
    const eventRef = doc(db, "events", finalUpdatedEvent.id);

    try {
      await updateDoc(eventRef, { ...finalUpdatedEvent });
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === finalUpdatedEvent.id ? finalUpdatedEvent : event))
      );
    } catch (error) {
      console.error("Error updating event in Firestore:", error);
      toast({ title: "Error", description: "Could not update event.", variant: "destructive" });
    }
  }, [authUser, events, toast]);

  const deleteEvent = useCallback(async (eventId: string) => {
    const eventToDelete = events.find(event => event.id === eventId);
    if (!eventToDelete) return;

    if (!authUser || authUser.uid !== eventToDelete.userId) {
      toast({ title: "Authorization Error", description: "You are not authorized to delete this event.", variant: "destructive" });
      return;
    }

    try {
      await deleteDoc(doc(db, "events", eventId));
      const regsQuery = query(collection(db, "registrations"), where("eventId", "==", eventId));
      const regsSnapshot = await getDocs(regsQuery);
      const batch = writeBatch(db);
      regsSnapshot.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });
      await batch.commit();

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      setRegistrations((prevRegistrations) => prevRegistrations.filter((reg) => reg.eventId !== eventId));
      
      toast({
        title: "Event Deleted",
        description: `"${eventToDelete.title}" and its registrations have been removed.`,
      });
    } catch (error) {
      console.error("Error deleting event from Firestore:", error);
      toast({ title: "Error", description: "Could not delete event.", variant: "destructive" });
    }
  }, [authUser, events, toast]);

  const getEventById = useCallback((id: string) => events.find((event) => event.id === id), [events]);
  const getEventBySlug = useCallback((slug: string) => events.find((event) => event.slug === slug), [events]);

  const addRegistration = useCallback(async (newRegData: Pick<Registration, 'eventId' | 'name' | 'email' | 'contactNumber'>): Promise<Registration | null> => {
    const registrationData: Omit<Registration, 'id'> = {
      eventId: newRegData.eventId,
      name: newRegData.name,
      email: newRegData.email,
      ...(newRegData.contactNumber && { contactNumber: newRegData.contactNumber }),
      registeredAt: new Date().toISOString(),
      source: 'form',
      checkedIn: false,
    };
    try {
      const docRef = await addDoc(collection(db, "registrations"), registrationData);
      const newRegistrationWithId: Registration = { ...registrationData, id: docRef.id };
      setRegistrations((prev) => [newRegistrationWithId, ...prev]);
      return newRegistrationWithId;
    } catch (error) {
      console.error("Error adding registration to Firestore:", error);
      toast({ title: "Registration Error", description: "Could not save registration.", variant: "destructive" });
      throw error; // Re-throw to be caught by the form
    }
  }, [toast]);

  const recordSharedLinkVisit = useCallback(async (eventId: string, eventSlug: string) => {
    const registrationDraft: Omit<Registration, 'id'> = {
      eventId,
      name: "Viewed via Shared Link",
      email: `shared-view-${Date.now()}@${eventSlug}.local`,
      registeredAt: new Date().toISOString(),
      source: 'shared_link',
      checkedIn: false,
    };
    try {
      const docRef = await addDoc(collection(db, "registrations"), registrationDraft);
      const newRegistrationWithId: Registration = { ...registrationDraft, id: docRef.id };
      setRegistrations((prev) => [newRegistrationWithId, ...prev]);
    } catch (error) {
      console.error("Error recording shared link visit in Firestore:", error);
    }
  }, []); 

  const getRegistrationsByEventId = useCallback((eventId: string) =>
    registrations.filter((reg) => reg.eventId === eventId && reg.source === 'form'), [registrations]);

  const getRegistrationByIdFromFirestore = useCallback(async (registrationId: string): Promise<Registration | null> => {
    try {
      const regRef = doc(db, "registrations", registrationId);
      const docSnap = await getDoc(regRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          eventId: data.eventId,
          name: data.name,
          email: data.email,
          contactNumber: data.contactNumber,
          registeredAt: data.registeredAt,
          source: data.source,
          checkedIn: data.checkedIn || false,
          checkedInAt: data.checkedInAt,
        } as Registration;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching registration by ID:", error);
      toast({ title: "Error", description: "Could not fetch registration details.", variant: "destructive" });
      return null;
    }
  }, [toast]);


  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        contextLoading,
        isGeneratingSlug,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventBySlug,
        addRegistration,
        recordSharedLinkVisit,
        getRegistrationsByEventId,
        getRegistrationByIdFromFirestore,
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

