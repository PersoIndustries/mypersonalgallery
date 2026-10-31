# MyPersonalGallery

Build a complete, modern and beautiful web application called **MyOwnMuseum**.

### Concept

MyOwnMuseum is a SaaS platform where anyone can create their own digital museums of collectible objects. 

The first use case is radio amateurs and collectors of vintage military radios, aircraft radios, ham radio equipment, etc., but the platform is completely generic: users can create museums for watches, cameras, cars, vinyl records, military gear, fossils, or any type of collection.

Each user can have multiple museums. Every museum is public by default and has its own public page. Users also have a public profile that shows all their museums.

### Main Goals

- Allow collectors to catalog their objects beautifully

- Let them share their collection with the world

- Make it feel like a real digital museum

### Key Features

1. **Public side (no login required)**

   - Homepage with featured museums and objects

   - Search page to discover museums and collectors

   - Public Profile page of any user (shows their museums)

   - Public Museum page (shows all objects of that museum with nice grid)

   - Public Object Detail page (images gallery, 3D model viewer placeholder, documents list, technical specs, history, etc.)

2. **Private side (after login)**

   - Dashboard: overview of my museums + recent objects

   - My Museums management (create, edit, delete museums)

   - Object Manager: full CRUD for objects inside a museum

   - When creating/editing an object the user can upload:

     - Multiple images (gallery)

     - One 3D model (placeholder for .glb / .gltf viewer)

     - Multiple documents (PDFs, manuals, circuit diagrams, etc.)

   - Profile settings

3. **Data structure (use realistic mock data)**

   - User: name, username, avatar, bio, location

   - Museum: title, description, cover image, category (Radios, Watches, Cars, etc.), isPublic

   - Object: 

     - title

     - description

     - year / manufacturer / model

     - category + tags

     - technical specifications (key-value pairs)

     - history / provenance

     - array of images

     - one 3D model url (placeholder)

     - array of documents (name + type + url)

     - condition (mint, excellent, good, fair...)

### Design Style

- Elegant, clean and premium (think museum + modern SaaS)

- Dark mode by default with a refined light mode toggle

- Color palette: deep charcoal, warm gold accents, soft grays, high quality typography

- Beautiful image galleries with lightbox

- Card-based layouts with subtle shadows and hover effects

- Museum aesthetic mixed with modern product design (similar to Are.na + Notion + Artstation)

### Pages to create

1. Landing / Home

2. Explore / Search (museums + users)

3. Public User Profile

4. Public Museum page

5. Public Object Detail page (very important – make it beautiful)

6. Login / Signup (simple mock)

7. Dashboard

8. My Museums list + create/edit museum

9. Object Manager (list + create/edit object with multi-image upload simulation, 3D model and documents)

10. Settings / Profile edit

### Technical notes for this version

- Use only frontend + local state / mock data (no real backend, no Supabase yet)

- Make everything feel real and interactive

- Include at least 3-4 example users, 5-6 museums and 15-20 objects (focus heavily on vintage military radios, aircraft radios, ham radios, but also add a couple of other collections like watches or cameras so it feels general)

- Use placeholder images of high quality (Unsplash style)

- For 3D model: show a nice placeholder card with “3D Model Viewer (coming soon)”

- Make the Object Detail page especially polished

### Extra polish

- Smooth page transitions

- Nice empty states

- Loading skeletons

- Responsive (mobile first but great on desktop)

- Toast notifications for actions

Start by creating a complete, production-quality looking prototype of MyOwnMuseum with all the pages and flows described above using realistic mock data focused on radio collectors.

Make the UI extremely polished and make the Object Detail page the most beautiful page of the app.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/63b2c757-7938-4ec9-9ed0-0490940e37fc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
