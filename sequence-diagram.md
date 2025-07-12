# Evntos - UML Sequence Diagram

This diagram illustrates the sequence of interactions for the primary use cases in the Evntos application.

**You can view this diagram by pasting the code below into a Mermaid.js editor, such as the one at [https://mermaid.live](https://mermaid.live).**

```mermaid
sequenceDiagram
    actor Organizer
    actor Guest
    participant Browser as Next.js UI
    participant EventContext as Client-Side Logic
    participant GenkitFlows as Server-Side Flows
    participant Firestore as Database
    participant ResendAPI as Email Service
    participant FirebaseStorage as Image Storage

    %% Event Creation Flow
    box Event Creation Flow
        Organizer->>Browser: Fills out and submits 'Create Event' form (title)
        Browser->>EventContext: addEvent({title})
        EventContext->>GenkitFlows: generateSeoFriendlyUrl({title})
        GenkitFlows-->>EventContext: Returns {slug}
        EventContext->>Firestore: addDoc('events', {eventData, slug})
        Firestore-->>EventContext: Confirms save, returns new event ID
        EventContext->>EventContext: Updates local state with new event
        EventContext-->>Browser: Updates UI
        Browser-->>Organizer: Redirects to event edit page
    end

    %% Image Upload Flow (within Event Edit)
    box Local Image Upload Flow
        Organizer->>Browser: Selects local image file in 'Edit Event' form
        Browser->>Browser: Creates local preview URL (object URL)
        Browser->>EventContext: uploadEventImage(eventId, file)
        EventContext->>FirebaseStorage: Uploads file
        FirebaseStorage-->>EventContext: Returns public image URL
        EventContext->>Firestore: updateDoc('events', eventId, {imageUrl})
        Firestore-->>EventContext: Confirms update
        EventContext->>EventContext: Updates local state with new URL
        EventContext-->>Browser: Re-renders form with final image URL
        Browser-->>Organizer: Displays confirmation toast
    end

    %% Guest Registration Flow
    box Guest Registration Flow
        Guest->>Browser: Fills out and submits registration form
        Browser->>EventContext: addRegistration({registrationData})
        EventContext->>Firestore: addDoc('registrations', {registrationData})
        Firestore-->>EventContext: Confirms save, returns new registration ID
        EventContext->>GenkitFlows: sendTicketEmail({registrationId, eventDetails})
        GenkitFlows->>GenkitFlows: Generates PDF ticket with QR code
        GenkitFlows->>ResendAPI: send({to, subject, html, attachment: pdf})
        ResendAPI-->>GenkitFlows: Confirms email sent
        GenkitFlows-->>EventContext: Returns {success: true}
        EventContext-->>Browser: Shows success message and download button
        Browser-->>Guest: Displays "Registration Confirmed" view
    end
```
