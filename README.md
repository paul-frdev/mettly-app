# MicroCRM (Mettly.io)

A minimal CRM system designed for self-employed professionals to manage their clients, appointments, and payments efficiently.

## Features

- Client Management
- Appointment Scheduling
- Payment Tracking
- Dashboard Analytics
- Email/Telegram Notifications
- Responsive Design

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- Authentication: (TBD - Clerk/Auth0)
- Database: PostgreSQL with Prisma
- Hosting: Vercel (Frontend), Railway/Render (Backend + DB)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- PostgreSQL (for local development)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/microcrm.git
   cd microcrm
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         # Reusable React components
│   ├── clients/       # Client-related components
│   ├── appointments/  # Appointment-related components
│   ├── payments/      # Payment-related components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── lib/               # Utilities and types
└── styles/            # Global styles

```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Vercel for hosting and deployment
