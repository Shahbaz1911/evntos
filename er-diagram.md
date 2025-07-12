# Evntos - Entity-Relationship Diagram

This diagram outlines the relationships between the main data entities in the Evntos application, primarily how they are structured in Firestore.

**You can view this diagram by pasting the code below into a Mermaid.js editor, such as the one at [https://mermaid.live](https://mermaid.live).**

```mermaid
erDiagram
    USER {
        string uid PK "User ID (from Firebase Auth)"
        string email
        string displayName
        string subscriptionStatus "Stored in localStorage"
    }

    EVENT {
        string id PK "Event ID"
        string userId FK "Creator's User ID"
        string title
        string description
        string imageUrl
        string slug
        boolean registrationOpen
        datetime createdAt
    }

    REGISTRATION {
        string id PK "Registration ID"
        string eventId FK "Event ID"
        string eventOwnerId FK "Event Creator's User ID"
        string name
        string email
        string contactNumber
        datetime registeredAt
    }

    USER ||--|{ EVENT : "creates"
    EVENT }|--|| REGISTRATION : "has"

```

### Relationships Explained:

1.  **USER to EVENT**:
    *   A `USER` can create one or many `EVENTS`.
    *   Each `EVENT` is created by exactly one `USER`.
    *   This is a **One-to-Many** relationship, linked by `USER.uid` and `EVENT.userId`.

2.  **EVENT to REGISTRATION**:
    *   An `EVENT` can have one or many `REGISTRATIONS`.
    *   Each `REGISTRATION` belongs to exactly one `EVENT`.
    *   This is a **One-to-Many** relationship, linked by `EVENT.id` and `REGISTRATION.eventId`.
