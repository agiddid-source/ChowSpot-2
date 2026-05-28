# 🥘 ChowSpot — Discover Nigerian Street Food

> A multi-page static web app for discovering, exploring, and ordering from the best Nigerian street food vendors — built with pure HTML, Tailwind CSS, and vanilla JavaScript.

---

## 📌 Overview

ChowSpot is a vendor discovery platform focused on Nigerian street food. Users can browse vendors across multiple cities, view full menus with pricing, check live opening hours, save favourites, and send orders directly via WhatsApp. Vendors can register through a dedicated form, and an admin panel handles approvals before new vendors go live on the storefront.

---

## 🗂️ Project Structure

```
chowspot/
├── index.html          # Homepage — hero, featured vendors, how it works
├── explore.html        # Browse & search all vendors with category filters
├── vendor.html         # Vendor profile page (dynamic, driven by ?vendor= param)
├── register.html       # Vendor registration form
├── admin.html          # Admin dashboard (login protected)
├── app.js              # All JavaScript logic — shared across all pages
├── vendors.json        # Vendor data store — single source of truth
└── Images/             # Local dish and vendor cover photos
```

---

## ✨ Features

### For Users
- **Vendor Discovery** — browse all vendors with category filters (Suya, Shawarma, Jollof, Bole, Local Dishes, Small Chops)
- **Live Search** — search vendors by name, category, or city in real time
- **Open Now Badge** — each vendor card shows a live green/red open status based on actual opening hours and the current time
- **Vendor Profile Pages** — full page per vendor with hero image, description, location, Google Maps embed, opening hours, and menu
- **Menu & Cart** — add dishes to cart with quantity controls; cart slides in from the side
- **WhatsApp Ordering** — cart checkout sends a pre-formatted order message directly to the vendor's WhatsApp
- **Save Vendors** — heart-save any vendor; saved to localStorage
- **Customer Reviews** — star rating form on every vendor page; reviews appear instantly
- **Share on WhatsApp** — share any vendor's profile link from the explore page
- **Back to Top Button** — appears after scrolling past the midpoint of any page

### For Vendors
- **Registration Form** — multi-section form covering business details, location & contact, menu highlights (up to 6 dishes with cover photos), and opening hours per day
- **Menu Photo Upload** — drag-and-drop or click-to-upload cover photo for each dish
- **Submissions saved to localStorage** — registration data is preserved and accessible to the admin

### For Admins
- **Login Protected** — admin portal requires username and password (session-based via `sessionStorage`)
- **Submission Dashboard** — view all vendor registrations with full details, menu previews, and opening hours
- **Filter by Status** — tab between All / Pending / Approved / Rejected submissions
- **Approve / Reject / Delete** — one-click status management
- **Auto-sync to Storefront** — approving a vendor instantly writes them to `chowspot_approved_vendors` in localStorage; they appear on the storefront immediately (on the same browser)
- **Export vendors.json** — downloads a merged `vendors.json` (existing vendors + all newly approved ones) for permanent deployment
- **Generate Code** — produces a ready-to-paste JS vendor object for manual use if needed
- **Sign Out** — clears the admin session

---

## 🚀 Getting Started

### 1. Clone or download the project

```bash
git clone https://github.com/yourusername/chowspot.git
cd chowspot
```

### 2. Serve locally

Because `app.js` fetches `vendors.json` via `fetch()`, you need a local server — opening `index.html` directly as a file won't work.

**Using VS Code Live Server** (recommended)
Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html` → *Open with Live Server*.

**Using Python**
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000`.

**Using Node.js**
```bash
npx serve .
```

### 3. You're live
Open `index.html` in your browser. All pages share `app.js` and `vendors.json` — no build step, no dependencies to install.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) |
| Logic | Vanilla JavaScript (ES2020+) |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts — Poppins |
| Data | `vendors.json` + `localStorage` |
| Maps | Google Maps embed iframe |
| Ordering | WhatsApp deep links (`wa.me`) |

No frameworks. No build tools. No backend.

---

## 🔐 Admin Access

Navigate to `admin.html` to access the admin portal.

| Field | Value |
|---|---|
| Username | `chowspot` |
| Password | `admin1234` |

> **Important:** Change these credentials before deploying to production. Open `admin.html` and update the `ADMIN_USER` and `ADMIN_PASS` constants near the bottom of the `<script>` block.

---

## 🗃️ Vendor Data

All vendor data lives in `vendors.json`. Each vendor entry follows this structure:

```json
"vendor-slug": {
  "name": "Vendor Name",
  "location": "Short location label",
  "fullLocation": "Full address, City, State, Nigeria.",
  "whatsapp": "2348012345678",
  "description": "Short description of the vendor.",
  "image": "URL or relative path to cover image",
  "rating": "⭐ 4.8 Rating",
  "reviews": "240+ Reviews",
  "badge": "🔥 Badge Label",
  "map": "https://www.google.com/maps?q=...&output=embed",
  "hours": [
    { "day": "Monday", "time": "2PM - 11:30PM" },
    { "day": "Sunday", "time": "Closed" }
  ],
  "menu": [
    {
      "name": "Dish Name",
      "price": "₦3,500",
      "desc": "Short dish description.",
      "image": "URL or relative path to dish image"
    }
  ],
  "customerReviews": [
    { "name": "Reviewer Name", "review": "Review text." }
  ]
}
```

---

## 🔄 Adding a New Vendor (Admin Workflow)

1. Vendor fills out the registration form on `register.html` and submits
2. Admin logs into `admin.html`
3. Review the submission — check details, menu, opening hours
4. Click **Approve** — the vendor is instantly saved to `localStorage` and appears on the storefront on the admin's browser
5. Click **Export vendors.json** — downloads a complete, merged `vendors.json`
6. Replace the existing `vendors.json` in the project folder with the downloaded file
7. Redeploy (or just save the file if using a service like Netlify with drag-and-drop deploy) — the vendor is now live for all visitors

---

## 📄 Pages Reference

| Page | URL | Description |
|---|---|---|
| Homepage | `index.html` | Hero, featured vendors, how it works, footer |
| Explore | `explore.html` | Full vendor listing with search and category filters |
| Vendor Profile | `vendor.html?vendor=slug` | Single vendor page — menu, hours, cart, reviews |
| Register | `register.html` | Vendor registration form |
| Admin | `admin.html` | Password-protected admin dashboard |

---

## 🌍 Current Vendors

| Vendor | City | Category |
|---|---|---|
| Mama Nkechi Suya | Benin City | Suya |
| Bukka Royale | Benin City | Jollof |
| Shawarma Hub | Benin City | Shawarma |
| Amaka Bole Spot | Port Harcourt | Bole & Grill |
| Iya Basira Kitchen | Lagos | Local Dishes |
| Chops & Peppers | Abuja | Small Chops |

---

## 🔮 Planned Features

- [ ] Favorites page (view all saved vendors)
- [ ] City filter on explore page
- [ ] "Open now" filter toggle
- [ ] Vendor photo gallery / lightbox
- [ ] Order history across sessions
- [ ] PWA support (installable on home screen)
- [ ] Firebase backend for real-time vendor updates

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Built by

ChowSpot was designed and built as a full-featured Nigerian street food discovery platform. For questions, suggestions, or vendor partnerships — reach out via the registration form on the site.