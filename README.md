# BizzFlow — Lead, 18% GST Invoice & Accounts Sync Portal

A lightweight client-side business workflow web application built with **HTML5**, **CSS3**, and **Vanilla JavaScript** (`localStorage`) to manage B2B client leads, convert deals into **18% GST invoices**, and simulate external CRM/ERP/Accounts API synchronization with failure & retry logs.

## Key Features
- **Lead Management:** Add client leads with name, email, and base deal amount (`₹`), with search and status filtering.
- **18% GST Invoice Generation:** Convert `PENDING` leads into invoices with automatic `18%` GST and total payable calculation (`INVOICED`).
- **External Accounts / CRM Sync Simulation:** Sync invoiced records (`HTTP 200 OK` / `HTTP 503` failure simulation) with persistent sync logs and one-click **Retry Sync**.
- **Browser Persistence:** Stores leads and sync logs in `localStorage` with a **Reset Demo Data** button.

## Tech Stack
- **Frontend:** HTML5, CSS3
- **Logic & State:** JavaScript (ES6+), Browser `localStorage`

## How to Run Locally
1. Clone or download the repository:
   ```bash
   git clone [https://github.com/Sahirahmad-12/BizzFlow-Web.git](https://github.com/Sahirahmad-12/BizzFlow-Web.git)
   cd BizzFlow-Web