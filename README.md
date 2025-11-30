# Project Manager

A full-featured project management application built with Next.js, TypeScript, Prisma, and Stack Auth. Manage your goals, tasks, notes, and settings all in one place.

## Features

- 🎯 **Goals Management** - Create and track projects with priorities, statuses, and due dates
- ✅ **Task Management** - Break down projects into tasks and subtasks with completion tracking
- 📝 **Notes** - Take notes with tags and pinning functionality
- ⚙️ **Settings** - Customize your experience with theme, preferences, and defaults
- 📅 **Timeline View** - Visualize all your tasks and projects on a timeline
- 🔐 **Authentication** - Secure user authentication with Stack Auth
- 🌓 **Dark Mode** - Built-in theme support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Stack Auth
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons, Framer Motion
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- Stack Auth account

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd projectmanager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID="your-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-publishable-client-key"
STACK_SECRET_SERVER_KEY="your-secret-server-key"

# Optional: For seeding database
SEED_USER_ID="your-user-id-here"
USE_TEST_USERS="false"
```

#### Getting Your Database URL

1. Sign up for [Neon](https://neon.tech) (free tier available)
2. Create a new project
3. Copy the connection string from your project dashboard
4. Paste it into `DATABASE_URL`

#### Getting Your Stack Auth Keys

1. Sign up for [Stack Auth](https://stack-auth.com)
2. Create a new project
3. Navigate to your project settings
4. Copy the following values:
   - **Project ID** → `NEXT_PUBLIC_STACK_PROJECT_ID`
   - **Publishable Client Key** → `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - **Secret Server Key** → `STACK_SECRET_SERVER_KEY`

### 4. Set Up the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

This will:
- Create all necessary database tables
- Generate the Prisma Client
- Apply the initial migration

### 5. (Optional) Seed the Database

To populate the database with sample data:

```bash
npm run seed
```

**Note**: Make sure to set `SEED_USER_ID` in your `.env` file to your actual Stack Auth user ID if you want to seed data for your account. You can find your user ID in the Stack Auth dashboard or after signing in to the app.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Sign In

- Click "Sign In" on the homepage
- Create an account or sign in with your existing Stack Auth account
- You'll be redirected to the dashboard

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with sample data
- `npx prisma studio` - Open Prisma Studio to view/edit database data
- `npx prisma migrate dev` - Create and apply a new migration
- `npx prisma generate` - Generate Prisma Client

## Project Structure

```
projectmanager/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── projects/      # Project endpoints
│   │   ├── tasks/         # Task endpoints
│   │   ├── notes/         # Note endpoints
│   │   ├── settings/      # Settings endpoints
│   │   └── user/          # User endpoints
│   ├── components/        # React components
│   │   ├── features/      # Feature-specific components
│   │   ├── layout/        # Layout components
│   │   ├── modals/        # Modal components
│   │   └── ui/            # Reusable UI components
│   ├── dashboard/         # Dashboard page
│   └── sign-in/           # Sign-in page
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   ├── validation.ts     # Zod validation schemas
│   └── error-handler.ts  # Error handling utilities
├── prisma/               # Prisma configuration
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Database seeding script
│   └── migrations/      # Database migrations
└── stack/               # Stack Auth configuration
    ├── client.tsx       # Client-side Stack Auth
    └── server.tsx       # Server-side Stack Auth
```

## Database Schema

The application uses the following main models:

- **Project** - Goals/projects with status, priority, and due dates
- **Task** - Tasks associated with projects
- **SubTask** - Subtasks associated with tasks
- **Note** - User notes with tags and pinning
- **Setting** - User preferences and settings

All data is user-scoped and isolated by `userID`.

## API Routes

All API routes are protected and require authentication. They follow RESTful conventions:

- `GET /api/projects` - Get all projects for the authenticated user
- `POST /api/projects` - Create a new project
- `PATCH /api/projects/[id]` - Update a project
- `DELETE /api/projects/[id]` - Delete a project
- `GET /api/tasks` - Get all tasks for the authenticated user
- `POST /api/projects/[id]/tasks` - Create a task for a project
- `PATCH /api/tasks/[id]` - Update a task
- `DELETE /api/tasks/[id]` - Delete a task
- Similar patterns for notes and settings

All routes include:
- Input validation using Zod
- Standardized error handling
- User authentication checks
- User-scoped data access

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's project settings
4. Deploy!

Vercel will automatically:
- Detect Next.js
- Run `npm run build`
- Deploy your application

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `DATABASE_URL`
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`

**Important**: Never commit your `.env` file to version control. It's already in `.gitignore`.

### Database Migrations in Production

After deploying, run migrations on your production database:

```bash
npx prisma migrate deploy
```

Or use Vercel's build command to run migrations automatically:

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

## Development

### Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting with Next.js config
- **Zod** - Runtime validation for API routes
- **Error Handling** - Standardized error responses

### Best Practices

- All API routes validate input using Zod schemas
- Error responses follow a consistent format
- User data is always scoped by `userID`
- Console logs are removed in production code
- Environment variables are validated on startup

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that your Neon database is running
- Ensure SSL mode is enabled (`?sslmode=require`)

### Authentication Issues

- Verify all Stack Auth environment variables are set
- Check that your Stack Auth project is active
- Ensure redirect URLs are configured in Stack Auth dashboard

### Migration Issues

- Run `npx prisma generate` to regenerate the Prisma Client
- Check that your database schema matches `prisma/schema.prisma`
- Use `npx prisma migrate reset` (⚠️ deletes all data) to reset migrations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the repository.
