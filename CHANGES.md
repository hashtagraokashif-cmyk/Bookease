# What changed

The design was kept as it was. What changed is that everything behind it now
works for real. Setup and usage are in `README.md`.

## Bugs fixed

- **Bookings are now saved.** "Confirm Appointment" used to jump to the
  success page without sending anything to the server.
- **The appointment API is switched on.** The routes existed but were never
  connected in `server.js`, so they returned "Route not found".
- **My Appointments shows your real bookings.** It used to show one sample
  appointment written into the page.
- **Each provider page shows that provider.** Every page used to show
  "Dr. Ahmed Khan".
- **Booked times can't be booked again.** Time slots used to be a fixed list,
  always "available".
- **The site knows when you're logged in.** The menu used to show
  Login/Signup even after logging in, there was no logout, and account pages
  were open to anyone.
- **The navbar buttons have their intended look.** A class-name clash with the
  login form turned both blue, and the Signup button used a class with no
  styles.
- **The Dashboard's "View Profile" button works.** It used to lead to a page
  that didn't exist.
- **The Services page has the menu bar and footer.**
- **The browser tab says "BookEase".** It used to say "frontend".
- **Sign-up can't be used to make yourself a provider.** Choosing the role on
  the form is no longer accepted.

## Added (backend)

- Providers and services stored in MongoDB, with working days, hours and a
  lunch break. Demo data via `npm run seed`.
- A live availability endpoint: free and booked times for any date.
- Booking rules enforced on the server:
  - price and duration come from the database, not the browser
  - no past dates, closed days, lunch-break times, or bookings more than 60
    days ahead
  - no overlapping bookings, even if two people book at the same moment
  - no double-booking yourself
- Customers can cancel. Providers can confirm, decline, cancel and complete.
  Cancelling frees the time for others.
- Profile editing and password change.
- Clear error messages, and a malformed id returns "not found" instead of
  crashing.
- 24 automated API tests (`npm test`).

## Added (frontend)

- A provider dashboard: booking requests, upcoming, to-complete and history,
  with the customer's phone, email and note.
- A profile page.
- A "page not found" page.
- "Book Appointment" on a service card opens the provider with that service
  already selected.
- Logging in or signing up halfway through a booking brings you back to it,
  with your choice kept.
- The booking page uses the design in `BookAppointment.css`, which existed but
  wasn't used, including an optional note to the provider.
- Statuses have colours. Only "Pending" was styled before.

## Phones, tablets and Macs

- **Phone menu.** On screens up to 850px wide (phones, phones held sideways,
  tablets), the menu is now one slim bar with a ☰ button. It used to stack into
  three or four rows: about a third of a phone screen, and half of a phone held
  sideways, all fixed at the top while scrolling. It's now 65px. Desktop is
  unchanged.
- **Easier tapping.** Menu, footer, "Back" and contact links were about 16px
  tall, under the 24px accessibility minimum. They now have tap areas of
  28–45px without moving anything on screen. The "Booked" label under time
  slots went from 10px to 11px.
- **iPhones no longer zoom in when you tap a text field.** Fields use 16px
  text on Apple devices only; everything else keeps the 14px design.
- **The footer knows you're logged in.** It shows Dashboard, My Appointments
  and My Profile instead of Login and Create Account.
- **Port 5050 instead of 5000.** On Macs, AirPlay Receiver uses port 5000,
  which made the site say "Can't reach the server".
- **Works from a phone on the same Wi-Fi.** The website passes its API
  requests on to the backend, and the backend accepts pages opened from your
  local network. See "Use it on your phone" in the README.

Tested on 9 screen sizes from a folded Galaxy Fold (280px) to desktop, on all
13 screens (117 renders):

- no sideways scrolling, nothing off the edge, no cut-off text
- no tap target under 24px, no text under 11px
- on desktop, every screen is pixel-identical to before

## Cleaned up

- Removed:
  - four empty files (the Register page and its CSS, `services/api.js`,
    `index.css`)
  - the unused Hero component, three unused images, and an unused icon file
- The frontend no longer lists the project itself as one of its packages.
- `node_modules` and `dist` are now git-ignored. They were committed before.
  To stop git tracking the copies already saved, run this once and commit:

  ```bash
  git rm -r --cached backend/node_modules frontend/node_modules frontend/dist
  ```
