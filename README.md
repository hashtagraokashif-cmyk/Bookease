# BookEase - Appointment Booking System

Customers browse providers (doctors, consultants, salons, lawyers), pick a
service and a free time, and book. Providers log in to confirm, decline,
cancel or complete their bookings.

- `frontend/` - React + Vite website (http://localhost:5173)
- `backend/` - Express + MongoDB API (http://localhost:5050)

## What you need

- **Node.js 20.19+** (or 22.12+). Check with `node -v`.
- **MongoDB** running locally at `mongodb://localhost:27017`. On a Mac:
  `brew services start mongodb-community`. You can use MongoDB Atlas instead.

## First-time setup

From this folder (the one containing `backend` and `frontend`):

```bash
npm install                    # installs the root helper, backend and frontend
cp backend/.env.example backend/.env    # skip if backend/.env already exists
npm run seed                   # adds the demo providers, services and logins
```

## Run it

```bash
npm run dev
```

Both apps start in one terminal, each line labelled `[backend]` or
`[frontend]`. Open **http://localhost:5173**. Press `Ctrl+C` once to stop.

## Use it on your phone

1. Make sure your phone is on the **same Wi-Fi** as your computer.
2. Run `npm run dev`. Find the `[frontend]` line that says **Network**,
   for example `http://192.168.1.5:5173/`.
3. Open that address in your phone's browser. On a Mac, click **Allow** if it
   asks about incoming connections for "node".

Only the one address is needed: the website passes its backend requests on to
your computer itself. University, office and guest Wi-Fi often block devices
from seeing each other. If so, use your phone's hotspot instead.

While it's running, anyone on the same Wi-Fi can open it, so avoid running it
on public Wi-Fi.

The layout works on phones (including folded Galaxy Fold screens), phones held
sideways, tablets and desktops. On screens up to 850px wide the menu becomes a
single bar with a ☰ button.

## Demo logins (created by `npm run seed`)

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@bookease.test | Customer@123 |
| Provider - Dr. Ahmed Khan | ahmed@bookease.test | Provider@123 |
| Provider - Sarah Ahmed | sarah@bookease.test | Provider@123 |
| Provider - Style Studio | stylestudio@bookease.test | Provider@123 |
| Provider - Ali Legal Consultants | ali@bookease.test | Provider@123 |

Anyone can also sign up as a new customer from the site.

## How booking works

1. **Services** lists every service from the database. Filter by category,
   location or search.
2. A **provider page** shows that provider's services. Pick one and a date to
   see the real free times. Booked times show as "Booked", the lunch break and
   closed days are skipped, and today's past times are hidden.
3. **Confirm** asks you to log in or sign up if needed, then brings you back
   with your choice kept. The server checks the time again and saves the
   booking as **Pending**.
4. The **provider** sees the request on their dashboard and confirms or
   declines it. Once the appointment time has passed they can mark it
   **Completed**.
5. The **customer** follows the status in My Appointments and can cancel
   before it starts. Cancelling frees the time for someone else.

### Rules the server enforces

- Price and duration always come from the database, never from the browser.
- A time can only be booked once. Overlaps are blocked too: a 45-minute booking
  at 9:00 also blocks 9:30. This holds even if two people press Confirm at the
  same moment, because the database itself refuses the second claim.
- No past dates, no closed days, no bookings during the lunch break, and no
  more than 60 days ahead.
- A customer can't book two appointments at overlapping times.
- Customers only see their own bookings; providers only see bookings made with
  them. Providers can't book, and sign-up always creates a customer.

## Put it online (one Render service)

The backend also serves the website once it has been built, so the whole app
runs as **one** Render web service on one address. No separate frontend host is
needed.

1. **Database:** create a free MongoDB Atlas cluster. Add a database user, and
   allow access from anywhere (`0.0.0.0/0`) under Network Access. Fill it with
   the demo data from your computer:
   ```bash
   MONGO_URI="your-atlas-connection-string" npm run seed
   ```
2. **Code:** push this project to GitHub.
3. **Render:** go to **New → Web Service**, pick the repository, and use:

   | Setting | Value |
   | --- | --- |
   | Root Directory | *(leave empty)* |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start --prefix backend` |
   | Instance Type | Free |
   | Environment variables | `MONGO_URI` (your Atlas string) and `JWT_SECRET` (a long random string) |

4. **Check it:** open `https://<your-service>.onrender.com` for the website,
   and `https://<your-service>.onrender.com/api/health` for the API.

**Free-plan limits:** the service sleeps after 15 minutes without visitors,
so the first visit after that takes about a minute.

The Node version is set in `.node-version` (Node 22).

## Other commands

| Command | What it does |
| --- | --- |
| `npm run seed` | Adds demo data. Safe to re-run; it never deletes anything |
| `npm run seed:fresh` | **Deletes all users, providers and appointments**, then re-adds the demo data |
| `npm test` | Runs 24 API tests against a separate test database (needs MongoDB running) |
| `npm run build` | Builds the frontend for deployment into `frontend/dist` |

## API

All under `http://localhost:5050/api`. Routes marked with a role need an
`Authorization: Bearer <token>` header from login or sign-up.

| Method | Path | Who | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | anyone | Create a customer account, returns a token |
| POST | `/auth/login` | anyone | Log in, returns a token |
| GET | `/health` | anyone | Check the API is running |
| GET | `/auth/me` | logged in | Current user |
| PUT | `/auth/me` | logged in | Update name and phone |
| PUT | `/auth/me/password` | logged in | Change password |
| GET | `/services` | anyone | All bookable services with their provider |
| GET | `/providers` | anyone | All providers |
| GET | `/providers/:id` | anyone | One provider and its services |
| GET | `/providers/:id/availability?date=&serviceId=` | anyone | Free and booked times for a day |
| POST | `/appointments` | customer | Book `{ serviceId, date, time, notes }` |
| GET | `/appointments/my` | customer | Your appointments |
| GET | `/appointments/provider` | provider | Bookings made with you |
| GET | `/appointments/:id` | its customer or provider | One appointment |
| PATCH | `/appointments/:id/status` | its customer or provider | `{ status }`: Confirmed, Cancelled or Completed |

## Settings (`backend/.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5050` | API port. Not 5000: on Macs, AirPlay Receiver uses that port |
| `MONGO_URI` | `mongodb://localhost:27017/appointment_booking` | Database |
| `JWT_SECRET` | none, required | Signs login tokens. Use a long random string |
| `CLIENT_URL` | none | The deployed frontend's address (localhost always works) |
| `APP_TIMEZONE` | `Asia/Karachi` | Timezone for "today" and past-time checks |

The frontend sends its requests to `/api`, which the Vite server passes on to
the backend at `localhost:5050` (set in `frontend/vite.config.js`). If you
change the backend port, change it there too. `VITE_API_URL` in
`frontend/.env` is only needed when the frontend is deployed separately.

## Adding providers

Provider accounts are linked to a provider profile, so they aren't created from
the public sign-up form. To add one, add an entry to `backend/seed/data.js` and
run `npm run seed`.
