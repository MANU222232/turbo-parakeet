# System Architecture Diagram

## Role-Based Access Control Flow

```mermaid
graph TB
    User[User] --> Login[Login Page]
    Login --> Auth{Authentication}
    Auth -->|Success| JWT[JWT Token with Role]
    Auth -->|Fail| Login
    
    JWT --> Customer{Role Check}
    
    Customer -->|customer| CustomerPortal[/customer Portal]
    Customer -->|driver| DriverPortal[/driver Portal]
    Customer -->|admin| AdminPortal[/admin Portal]
    Customer -->|shop_owner| ShopPortal[/shops Portal]
    
    CustomerPortal --> CustomerAPI[Customer API Endpoints]
    DriverPortal --> DriverAPI[Driver API Endpoints]
    AdminPortal --> AdminAPI[Admin API Endpoints]
    
    CustomerAPI --> ProfileCheck[Profile Role Verification]
    DriverAPI --> ProfileCheck
    AdminAPI --> ProfileCheck
    
    ProfileCheck --> DB[(PostgreSQL)]
    ProfileCheck --> Redis[(Redis Cache)]
```

## Component Hierarchy

```mermaid
graph TD
    App[Next.js App] --> Middleware[middleware.ts]
    Middleware --> Public[Public Routes]
    Middleware --> Protected[Protected Routes]
    
    Protected --> PR[ProtectedRoute Component]
    PR --> Hook[useRoleRedirect Hook]
    Hook --> Session[NextAuth Session]
    Session --> API[Backend API]
    
    API --> Security[security.py Dependencies]
    Security --> Models[Profile Model]
    Models --> Database[(PostgreSQL)]
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant M as Middleware
    participant B as Backend
    participant D as Database
    
    U->>F: Navigate to /customer
    F->>M: Check session token
    M->>M: Validate role
    M->>F: Allow access
    
    F->>B: GET /api/v1/profiles/me
    B->>B: Extract JWT
    B->>B: Verify role
    B->>D: Query profile
    D->>B: Return data
    B->>F: Return profile
    F->>U: Display dashboard
```

## Portal Architecture

```mermaid
graph LR
    subgraph "Customer Portal"
        C1[Overview Tab]
        C2[Orders Tab]
        C3[Profile Tab]
    end
    
    subgraph "Driver Portal"
        D1[Mission Control]
        D2[Earnings]
        D3[Chat]
    end
    
    subgraph "Admin Portal"
        A1[Dispatch Board]
        A2[Fleet Status]
        A3[Live Map]
        A4[Communications]
    end
    
    C1 --> API[API Gateway]
    C2 --> API
    C3 --> API
    D1 --> API
    D2 --> API
    D3 --> API
    A1 --> API
    A2 --> API
    A3 --> API
    A4 --> API
    
    API --> SocketIO[Socket.IO Server]
    SocketIO --> RealTime[Real-time Updates]
```

## Database Schema

```mermaid
erDiagram
    USERS ||--|| PROFILES : has
    USERS ||--o{ ORDERS : places
    USERS ||--o{ DRIVER_LOCATIONS : updates
    SHOPS ||--o{ ORDERS : fulfills
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ CHAT_MESSAGES : has
    
    USERS {
        uuid id PK
        string name
        string phone
        string email UK
        UserRole role
        boolean verified
        datetime created_at
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK UK
        UserRole role
        string avatar_url
        string bio
        string address
        string city
        string state
        string zip_code
        string country
        string emergency_contact_name
        string emergency_contact_phone
        text preferences
        boolean is_active
        datetime last_login
    }
    
    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid shop_id FK
        uuid driver_id FK
        OrderStatus status
        float location_lat
        float location_lng
        string location_address
        string issue_description
        decimal total_amount
        datetime created_at
    }
```

## Security Layers

```mermaid
graph TB
    subgraph "Layer 1: Middleware"
        M1[Session Token Check]
        M2[Route Protection]
    end
    
    subgraph "Layer 2: Frontend"
        F1[ProtectedRoute Component]
        F2[Role Verification]
    end
    
    subgraph "Layer 3: Backend"
        B1[JWT Validation]
        B2[Profile Lookup]
        B3[Role Authorization]
    end
    
    subgraph "Layer 4: Database"
        D1[Foreign Key Constraints]
        D2[Row Level Security]
    end
    
    M1 --> M2
    M2 --> F1
    F1 --> F2
    F2 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> D1
    D1 --> D2
```

## Socket.IO Event Flow

```mermaid
graph LR
    Client[Client] --> Connect[Connect to Socket]
    Connect --> JoinRoom[Join Room]
    
    JoinRoom --> AdminRoom[admin_room]
    JoinRoom --> OrderRoom[order_{id}]
    
    AdminRoom --> AdminEvents[Admin Events]
    OrderRoom --> OrderEvents[Order Events]
    
    AdminEvents --> A1[order:new]
    AdminEvents --> A2[order:status_change]
    AdminEvents --> A3[driver:location_update]
    
    OrderEvents --> O1[new_chat_message]
    OrderEvents --> O2[order:image_added]
    
    A1 --> Broadcast[Broadcast to Clients]
    A2 --> Broadcast
    A3 --> Broadcast
    O1 --> Broadcast
    O2 --> Broadcast
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend"
        NextJS[Next.js 14]
        React[React 18]
        NextAuth[NextAuth.js]
        Tailwind[Tailwind CSS]
        Framer[Framer Motion]
        SocketIO[Socket.IO Client]
    end
    
    subgraph "Backend"
        FastAPI[FastAPI]
        SQLAlchemy[SQLAlchemy ORM]
        Alembic[Alembic Migrations]
        Pydantic[Pydantic Models]
        UVICorn[UVICorn Server]
    end
    
    subgraph "Database"
        PostgreSQL[PostgreSQL 15]
        Redis[Upstash Redis]
    end
    
    subgraph "Infrastructure"
        Vercel[Vercel Hosting]
        Render[Render Hosting]
        Supabase[Supabase Postgres]
    end
    
    NextJS --> FastAPI
    FastAPI --> SQLAlchemy
    SQLAlchemy --> PostgreSQL
    FastAPI --> Redis
```

## Deployment Architecture

```mermaid
graph TB
    User --> CDN[Vercel Edge Network]
    CDN --> NextApp[Next.js App]
    
    NextApp --> API[FastAPI Backend]
    API --> DB[Supabase PostgreSQL]
    API --> Cache[Upstash Redis]
    
    NextApp --> Auth[NextAuth Sessions]
    API --> Socket[Socket.IO Server]
    
    Socket --> RealTime[Real-time Updates]
    RealTime --> NextApp
```
