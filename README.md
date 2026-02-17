# QueueBuddy Seats (Asset-Linker)

A live seat availability and reservation system designed to help users find and book short-term seats in venues. Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

## Features

### Client (User)
- **Venue Browsing**: View a list of available venues with real-time status.
- **Interactive Seat Map**: Grid-based visualization of seat layouts.
- **Live Availability**: Real-time updates on seat status (Available, Occupied, Reserved).
- **Instant Reservations**: Book seats for short durations (15, 30, or 45 minutes).
- **Reservation Management**: View active reservations and cancel them if needed.
- **Countdown Timer**: track remaining time for your active reservations.

### Admin
- **Dashboard**: Overview of venue and reservation statistics.
- **Venue Management**: Create and update venue details (Name, Location, Hours).
- **Seat Management**: Configure seat layouts, types (Standard, Premium, Accessible), and status.
- **Reservation Oversight**: View all active reservations and override/cancel them if necessary.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, TanStack Query, Wouter (Routing).
- **Backend**: Node.js, Express, Passport.js (Auth).
- **Database**: MongoDB with Mongoose ODM.
- **Language**: TypeScript (Full-stack).
- **Tooling**: `tsx` for execution, `zod` for validation.

## Prerequisites

- Node.js (v20+ recommended)
- MongoDB instance (local or Atlas)

## Setup & Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory with the following variables:
    ```env
    MONGODB_URI=mongodb://localhost:27017/asset-linker
    SESSION_SECRET=your_secret_key_here
    PORT=5000
    ```

4.  **Seed the Database** (Optional but recommended for first run):
    Populate the database with initial venues and seats:
    ```bash
    npm run seed
    ```

## Running the Application

### Development Mode
Runs the backend and frontend concurrently with hot-reloading.
```bash
npm run dev
```
The application will be available at `http://localhost:5000`.

### Type Checking
Verify TypeScript types:
```bash
npm run check
```

### Production Build
Build the client and server for production:
```bash
npm run build
```
Start the production server:
```bash
npm run start
```

## Project Structure

- `client/`: React frontend application.
- `server/`: Express backend application.
- `shared/`: Shared types and schemas (Zod).
- `script/`: Build and utility scripts.
