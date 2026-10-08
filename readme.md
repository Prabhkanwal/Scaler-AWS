# AWS Route 53 Clone

A full-stack recreation of the core **Amazon Route 53 console
experience**, built as a technical assignment for **Scaler Labs**.

The project focuses on reproducing the Route 53 web application's
navigation, visual language, hosted-zone workflows, DNS record
management, persistence, and API-driven architecture --- without
implementing actual DNS resolution or integrating with AWS
infrastructure.

> **Assignment:** AWS Route 53 Clone\
> **Frontend:** Next.js + TypeScript\
> **Backend:** FastAPI\
> **Database:** SQLite

------------------------------------------------------------------------

## Live Demo

**Hosted application:** `https://route53-psi.vercel.app/signin`
**Deployed Backend:** `https://route53-production.up.railway.app/`

------------------------------------------------------------------------

## Demo Credentials

The application uses mocked authentication as required by the
assignment.

``` text
Username: admin
Password: admin123
```

Authentication is implemented with a database-backed session and an
HTTP-only cookie. The session remains active across page refreshes until
the user logs out.

------------------------------------------------------------------------

## Overview

This project recreates the core Route 53 management experience around
two primary resources:

1.  **Hosted Zones**
2.  **DNS Records**

The application provides a complete CRUD workflow backed by a persistent
SQLite database.

### Main user flow

``` text
Login
  ↓
Get Started
  ↓
Hosted Zones
  ↓
Create / Search / Edit / Delete Hosted Zone
  ↓
Hosted Zone Details
  ↓
View / Search / Filter / Paginate DNS Records
  ↓
Create / Edit / Delete DNS Record
```

The UI is intentionally designed around the AWS console experience,
using AWS/Cloudscape-inspired typography, spacing, controls, navigation
patterns, tables, forms, notifications, and visual hierarchy.

------------------------------------------------------------------------

# Features

## Authentication

-   Mocked AWS-style login
-   Database-backed user account
-   Password verification using bcrypt
-   Persistent server-side sessions
-   HTTP-only session cookie
-   Session restoration using `GET /api/auth/me`
-   Logout
-   Protected resource APIs

Authentication is intentionally mocked because the assignment does not
require AWS IAM, Cognito, OAuth, MFA, or real AWS account integration.

------------------------------------------------------------------------

## Get Started

The Route 53-style Get Started page provides the major Route 53 entry
points.

### Functional

-   Create hosted zones

### UI-only / Coming Soon

-   Register a domain
-   Transfer domain
-   Configure health checks
-   Configure traffic flow
-   Configure resolvers

Only functionality required by the assignment is implemented.

------------------------------------------------------------------------

# Hosted Zone Management

Hosted zones support full CRUD operations.

### Supported operations

-   View hosted zones
-   Search hosted zones
-   Paginate hosted zones
-   Create hosted zone
-   Edit hosted zone
-   Delete hosted zone
-   View hosted zone details

### Hosted zone fields

  Field         Description
  ------------- ---------------------------
  Domain name   Required hosted-zone name
  Description   Optional description
  Type          Public or Private

Hosted zone names are checked for duplicates by the backend.

### Public and private zones

The UI supports:

-   Public hosted zone
-   Private hosted zone

Private hosted zones are persisted with `type = private`.

The project does **not** implement actual VPC association because real
AWS networking is outside the assignment scope.

------------------------------------------------------------------------

# DNS Record Management

DNS records are managed inside individual hosted zones.

### Supported record types

``` text
A
AAAA
CNAME
TXT
MX
NS
PTR
SRV
CAA
```

### Supported operations

-   List records
-   Search records
-   Filter by record type
-   Paginate records
-   Create record
-   Edit record
-   Delete record
-   Refresh record list

### Record fields

  Field   Description
  ------- ---------------------------
  Name    DNS record name
  Type    Supported DNS record type
  TTL     Time-to-live, minimum 1
  Value   Record value

The backend validates record types and required fields using Pydantic
schemas.

------------------------------------------------------------------------

# UI / UX

The interface is designed to closely reproduce the Route 53 console
experience rather than creating a generic dashboard.

The visual implementation follows the structure and interaction patterns
visible in the AWS Route 53 console:

-   AWS-style top navigation
-   Breadcrumb navigation
-   Page headers
-   Secondary actions
-   Tables
-   Search fields
-   Filters
-   Pagination
-   Forms
-   Radio/selection controls
-   Confirmation dialogs
-   Success/error notifications
-   Hosted-zone detail views
-   AWS-style content density
-   Responsive layouts

The project uses the **Cloudscape Design System** as a visual reference
for AWS-style design principles including typography, colors, spacing,
borders, components, and accessibility.

Official resources:

-   https://cloudscape.design/
-   https://cloudscape.design/foundation/visual-foundation/colors/
-   https://cloudscape.design/foundation/visual-foundation/design-tokens/
-   https://cloudscape.design/foundation/visual-foundation/typography/
-   https://cloudscape.design/components/

------------------------------------------------------------------------

# Architecture

``` text
┌──────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│              Next.js Frontend                │
│          TypeScript + React UI               │
└──────────────────────┬───────────────────────┘
                       │
                       │ HTTP / JSON
                       │ HTTP-only session cookie
                       ▼
┌──────────────────────────────────────────────┐
│              FastAPI Backend                 │
│                                              │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │    Auth    │ │   Zones    │ │ Records  │ │
│  │   Router   │ │   Router   │ │  Router  │ │
│  └────────────┘ └────────────┘ └──────────┘ │
│                       │                      │
│                SQLAlchemy ORM                │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 SQLite                       │
│                                              │
│   users                                      │
│   sessions                                   │
│   hosted_zones                               │
│   dns_records                                │
└──────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# Repository Structure

``` text
route53-clone/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── ...
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   ├── dependencies.py
│   │   │
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── hosted_zones.py
│   │       └── records.py
│   │
│   ├── route53.db
│   ├── requirements.txt
│   └── venv/
│
├── README.md
└── .gitignore
```

> `venv/` and other generated/runtime files should remain ignored by
> Git.

------------------------------------------------------------------------

# Database Design

SQLite is used for persistent storage, with SQLAlchemy providing the ORM
layer.

## Entity relationship

``` text
User
 │
 │ 1:N
 ▼
Session


HostedZone
 │
 │ 1:N
 ▼
DNSRecord
```

------------------------------------------------------------------------

## `users`

Stores mocked application users.

  Column          Type       Description
  --------------- ---------- ----------------------
  id              Integer    Primary key
  username        String     Unique username
  password_hash   String     bcrypt password hash
  created_at      DateTime   Creation timestamp

------------------------------------------------------------------------

## `sessions`

Stores authenticated application sessions.

  Column          Type       Description
  --------------- ---------- ----------------------------
  id              Integer    Primary key
  user_id         Integer    Foreign key to users
  session_token   String     Unique session token
  created_at      DateTime   Session creation timestamp

------------------------------------------------------------------------

## `hosted_zones`

Stores Route 53 hosted zones.

  Column         Type       Description
  -------------- ---------- -----------------------
  id             Integer    Primary key
  name           String     Hosted zone name
  type           String     `public` or `private`
  comment        String     Optional description
  private_zone   Boolean    Private-zone flag
  created_at     DateTime   Creation timestamp
  updated_at     DateTime   Last update timestamp

------------------------------------------------------------------------

## `dns_records`

Stores DNS records belonging to hosted zones.

  Column           Type       Description
  ---------------- ---------- -----------------------------
  id               Integer    Primary key
  hosted_zone_id   Integer    Foreign key to hosted_zones
  name             String     Record name
  type             String     DNS record type
  ttl              Integer    Record TTL
  value            String     Record value
  created_at       DateTime   Creation timestamp
  updated_at       DateTime   Last update timestamp

Deleting a hosted zone also removes its associated records through the
SQLAlchemy relationship cascade.

------------------------------------------------------------------------

# API

The backend exposes a REST-style API using FastAPI.

Base URL during local development:

``` text
http://127.0.0.1:8000
```

FastAPI automatically provides interactive API documentation at:

``` text
/docs
```

------------------------------------------------------------------------

## Authentication

### Login

``` http
POST /api/auth/login
```

Authenticates the mocked user and creates a database-backed session.

### Current user

``` http
GET /api/auth/me
```

Returns the authenticated user associated with the current session.

### Logout

``` http
POST /api/auth/logout
```

Invalidates the current session.

------------------------------------------------------------------------

# Hosted Zone API

### List hosted zones

``` http
GET /api/hosted-zones/
```

Supports:

``` text
search
page
page_size
```

Example:

``` text
GET /api/hosted-zones/?search=example&page=1&page_size=20
```

### Get hosted zone

``` http
GET /api/hosted-zones/{zone_id}
```

### Create hosted zone

``` http
POST /api/hosted-zones/
```

Example request:

``` json
{
  "name": "example.com",
  "type": "public",
  "comment": "Example hosted zone"
}
```

### Update hosted zone

``` http
PUT /api/hosted-zones/{zone_id}
```

### Delete hosted zone

``` http
DELETE /api/hosted-zones/{zone_id}
```

------------------------------------------------------------------------

# DNS Record API

### List records

``` http
GET /api/hosted-zones/{zone_id}/records/
```

Supports:

``` text
search
type
page
page_size
```

Example:

``` text
GET /api/hosted-zones/1/records/?search=www&type=A&page=1&page_size=20
```

### Get record

``` http
GET /api/hosted-zones/{zone_id}/records/{record_id}
```

### Create record

``` http
POST /api/hosted-zones/{zone_id}/records/
```

Example:

``` json
{
  "name": "www.example.com",
  "type": "A",
  "ttl": 300,
  "value": "192.0.2.10"
}
```

### Update record

``` http
PUT /api/hosted-zones/{zone_id}/records/{record_id}
```

### Delete record

``` http
DELETE /api/hosted-zones/{zone_id}/records/{record_id}
```

------------------------------------------------------------------------

# Validation

Request validation is handled by Pydantic schemas.

### Hosted zones

-   Domain name is required
-   Hosted-zone type is restricted to:
    -   `public`
    -   `private`
-   Description is optional
-   Duplicate hosted-zone names are rejected

### DNS records

-   Name is required
-   Type is restricted to the nine supported record types
-   TTL must be at least `1`
-   Value is required

Invalid requests return appropriate HTTP validation/error responses.

------------------------------------------------------------------------

# Pagination and Search

Both hosted zones and DNS records use backend-side pagination.

The list response contains:

``` json
{
  "items": [],
  "total": 0,
  "page": 1,
  "page_size": 20,
  "total_pages": 0
}
```

This keeps collection behavior consistent between the frontend and
backend and avoids relying entirely on client-side filtering.

------------------------------------------------------------------------

# Error Handling

The API uses standard HTTP status codes for common failure conditions.

Examples:

``` text
200 OK
201 Created
400 Bad Request
401 Unauthorized
404 Not Found
422 Validation Error
```

Examples of handled errors:

-   Invalid credentials
-   Unauthenticated API access
-   Hosted zone not found
-   DNS record not found
-   Duplicate hosted-zone name
-   Invalid record type
-   Invalid TTL
-   Missing required fields

The frontend displays user-facing feedback through notifications and
form validation states.

------------------------------------------------------------------------

# Local Development

## Prerequisites

Install:

-   Node.js
-   npm
-   Python 3.10+
-   Git

------------------------------------------------------------------------

## 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd route53-clone
```

------------------------------------------------------------------------

# Backend Setup

Open a terminal:

``` bash
cd backend
```

Create a virtual environment:

### Windows

``` bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

``` bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Start FastAPI:

``` bash
uvicorn app.main:app --reload
```

Backend:

``` text
http://127.0.0.1:8000
```

Swagger API documentation:

``` text
http://127.0.0.1:8000/docs
```

The SQLite database is created/used from:

``` text
backend/route53.db
```

The application seeds the mocked `admin` user when the backend starts.

------------------------------------------------------------------------

# Frontend Setup

Open another terminal:

``` bash
cd frontend
```

Install dependencies:

``` bash
npm install
```

Start the Next.js development server:

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# Running the Full Application

Two processes are required during local development.

### Terminal 1 --- Backend

``` bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 --- Frontend

``` bash
cd frontend
npm install
npm run dev
```

Then open:

``` text
http://localhost:3000
```

Login with:

``` text
admin
admin123
```

------------------------------------------------------------------------

# End-to-End Workflow

A typical evaluation flow is:

### 1. Login

``` text
/admin login
```

The frontend sends credentials to the FastAPI backend.

### 2. Get Started

Navigate through the Route 53-style landing experience.

### 3. Create a hosted zone

Enter:

``` text
example.com
```

Choose:

``` text
Public hosted zone
```

Create the zone.

### 4. Open the hosted zone

The application displays the hosted-zone details and records table.

### 5. Create a DNS record

Example:

``` text
Name: www.example.com
Type: A
TTL: 300
Value: 192.0.2.10
```

### 6. Search and filter

Use:

-   Search
-   Record type filter
-   Pagination

### 7. Edit the record

Modify any supported record field and save.

### 8. Delete the record

Delete the record and verify that it disappears from the table.

### 9. Edit the hosted zone

Update the hosted-zone name/type/comment.

### 10. Delete the hosted zone

Delete the zone and verify that the hosted zone and associated records
are removed.

------------------------------------------------------------------------

# Assignment Scope

The implementation intentionally separates **required functionality**
from **visual-only Route 53 sections**.

## Implemented

-   Mock authentication
-   Login
-   Logout
-   Session persistence
-   Hosted zone CRUD
-   Hosted zone search
-   Hosted zone pagination
-   DNS record CRUD
-   DNS record search
-   DNS record type filtering
-   DNS record pagination
-   SQLite persistence
-   FastAPI backend
-   Request validation
-   Error handling
-   AWS-style Route 53 navigation and UI
-   Notifications
-   Forms and tables
-   Hosted zone details

## Visual / Coming Soon

The following areas are represented in the UI where appropriate but are
not functionally implemented:

-   Register a domain
-   Transfer a domain
-   Health checks
-   Traffic policies / traffic flow
-   Resolver
-   Query logging
-   DNSSEC
-   Accelerated recovery
-   Hosted-zone tags
-   Test record
-   Other AWS account/infrastructure functionality

------------------------------------------------------------------------

# Explicitly Out of Scope

This project is a **Route 53 console clone**, not an implementation of
the Route 53 service itself.

It does not:

-   Query or modify real AWS Route 53
-   Require AWS credentials
-   Create real DNS zones
-   Perform real DNS resolution
-   Configure real VPCs
-   Manage AWS IAM users/accounts
-   Implement AWS billing
-   Implement domain registration
-   Implement domain transfer
-   Implement DNSSEC
-   Implement Route 53 health checks
-   Implement traffic policies
-   Implement query logging
-   Persist hosted-zone tags
-   Import BIND zone files
-   Export BIND/JSON zone files

These exclusions keep the implementation aligned with the assignment's
stated scope.

------------------------------------------------------------------------

# Engineering Decisions

## Why SQLite?

SQLite was explicitly required by the assignment and is sufficient for
this local/mock Route 53 environment.

It provides:

-   Persistent storage
-   Zero external database setup
-   Simple local development
-   SQL-backed relationships
-   Easy evaluation

------------------------------------------------------------------------

## Why FastAPI?

FastAPI provides:

-   Typed request/response models
-   Automatic OpenAPI documentation
-   Straightforward REST endpoints
-   Dependency injection
-   Good integration with SQLAlchemy
-   Built-in request validation through Pydantic

------------------------------------------------------------------------

## Why SQLAlchemy?

SQLAlchemy separates database access from API route logic and makes
relationships such as:

``` text
HostedZone → DNSRecord
User → Session
```

explicit in the application model.

------------------------------------------------------------------------

## Why server-side sessions?

The assignment requires mocked authentication with session persistence.

The implementation therefore uses:

``` text
Login
  ↓
Create DB session
  ↓
HTTP-only cookie
  ↓
Authenticated API requests
```

The frontend does not store authentication tokens in localStorage.

------------------------------------------------------------------------

## Why no real AWS integration?

The assignment explicitly focuses on recreating the Route 53 user
experience and core workflows rather than implementing actual DNS
functionality.

Keeping AWS infrastructure out of the implementation also makes the
project:

-   deterministic
-   locally runnable
-   easy to evaluate
-   independent of AWS credentials
-   aligned with the assignment requirements

------------------------------------------------------------------------

# Security Considerations

Although this is an assignment/demo application, several basic security
practices are followed:

-   Passwords are stored as bcrypt hashes rather than plaintext.
-   Session tokens are generated using a cryptographically secure random
    generator.
-   Session tokens are stored server-side.
-   Authentication cookies are HTTP-only.
-   Protected APIs require authentication.
-   Request data is validated using Pydantic.
-   The frontend does not persist session tokens in localStorage.

For a production AWS-scale application, additional controls such as CSRF
protection, secure cookie configuration behind HTTPS, rate limiting,
audit logging, secret management, stronger session lifecycle controls,
and a production identity provider would be required.

------------------------------------------------------------------------

# Visual Design References

The UI was developed with the AWS Route 53 console as the primary visual
reference and Cloudscape as the supporting AWS design-system reference.

Cloudscape is an open-source design system created for and used by AWS
products and services.

Useful references:

-   Cloudscape: https://cloudscape.design/
-   Cloudscape Foundation: https://cloudscape.design/foundation/
-   Colors:
    https://cloudscape.design/foundation/visual-foundation/colors/
-   Design Tokens:
    https://cloudscape.design/foundation/visual-foundation/design-tokens/
-   Typography:
    https://cloudscape.design/foundation/visual-foundation/typography/
-   Components: https://cloudscape.design/components/
-   AWS Route 53 documentation:
    https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/

The Route 53 documentation was also used to understand the terminology
and core hosted-zone/record workflows.


------------------------------------------------------------------------

# License

This project was created as a technical assignment / educational
implementation.

It is not affiliated with, sponsored by, or endorsed by Amazon Web
Services.

AWS, Amazon Route 53, and related trademarks belong to Amazon Web
Services, Inc. and its respective owners.
