# Authentication Guide

## Overview

The application now includes basic authentication using NextAuth.js with credentials provider and bcrypt password hashing. All routes are protected by default, requiring users to sign in before accessing the video generator.

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### Generating NEXTAUTH_SECRET

You can generate a secure secret using OpenSSL:

```bash
openssl rand -base64 32
```

For production, set `NEXTAUTH_URL` to your production domain:

```bash
NEXTAUTH_URL=https://video.labfab.ca
```

## Creating Users

### Development

To create a user in development, run:

```bash
npm run create-user
```

You will be prompted to enter:
- Username
- Password (minimum 6 characters)
- Password confirmation (hidden input)

### Production (Docker)

To create a user in a running Docker container:

```bash
docker exec -it <container-name> npm run create-user
```

Replace `<container-name>` with your actual container name or ID. You can find it with:

```bash
docker ps
```

### Example

```
$ npm run create-user

=== Create New User ===

Username: admin
Password: ******
Confirm password: ******

Hashing password...
Connecting to database...

✓ User "admin" created successfully!
User ID: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Database Schema

The users table has the following structure:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

## Sign-In Flow

1. Users accessing any protected route are redirected to `/auth/signin`
2. After successful authentication, users are redirected to their original destination
3. Sessions last for 30 days by default

## Protected Routes

All routes are protected except:
- `/auth/signin` - Sign-in page
- `/api/auth/*` - NextAuth API routes
- `/_next/*` - Next.js internal files
- Static files (favicon, robots.txt)

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **JWT Sessions**: Session data is stored in JWT tokens, not server-side
- **Secure Middleware**: NextAuth middleware protects all routes automatically
- **Directory Traversal Protection**: Video API routes validate filenames
- **Input Validation**: All user inputs are validated and sanitized

## Troubleshooting

### "Error: NEXTAUTH_SECRET environment variable is not set"

Make sure you've added `NEXTAUTH_SECRET` to your `.env` file and restarted the server.

### "Invalid username or password"

Double-check your credentials. Usernames are case-sensitive.

### Can't create user - "already exists"

The username is already taken. Choose a different username or check existing users in the database.

### User created but can't sign in

1. Verify the database file exists and is not corrupted
2. Check that the password was entered correctly during user creation
3. Restart the application to reload database connections

## Initial Setup Checklist

- [ ] Add `NEXTAUTH_SECRET` to `.env` file
- [ ] Add `NEXTAUTH_URL` to `.env` file
- [ ] Create at least one user with `npm run create-user`
- [ ] Test sign-in at `/auth/signin`
- [ ] Verify protected routes redirect to sign-in
- [ ] For production: Update `NEXTAUTH_URL` in `.env.docker`
- [ ] For production: Create admin user in Docker container
