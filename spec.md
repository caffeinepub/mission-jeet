# Mission Jeet

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Landing page with Mission Jeet branding, red (#CC0000) and black color scheme
- Logo placeholder on landing page (admin-uploadable logo stored as URL in backend)
- Two batch sections: JEE and NEET
- Student-facing batch browser: lists subjects and topics per batch
- Video lecture player page (embeds YouTube/external video URLs)
- Admin panel protected by username/password login (username: "admin", password: "missionjeet@admin") -- NO external auth, simple hardcoded credential check in backend
- Admin: upload/change platform logo (stored as a URL or blob URL)
- Admin: create/edit/delete subjects per batch
- Admin: create/edit/delete video lectures per subject (title, description, video URL, subject, batch)
- Backend stores: logo URL, batches (JEE/NEET), subjects (linked to batch), video lectures (title, description, URL, subject ID, order)

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend (Motoko):
   - Stable storage for: logoUrl (Text), subjects (id, name, batchType), videos (id, title, description, videoUrl, subjectId, order)
   - Admin session: simple token-based auth with hardcoded credentials
   - APIs: login, getLogoUrl, setLogoUrl, getBatches, getSubjects (by batch), getVideos (by subject), addSubject, editSubject, deleteSubject, addVideo, editVideo, deleteVideo
2. Frontend:
   - Landing page: branding, logo, batch selector (JEE / NEET)
   - Batch page: list subjects for selected batch, link to videos
   - Subject page: list videos, click to watch
   - Video player page: embed video URL (YouTube iframe or direct player)
   - Admin login page: username + password form
   - Admin dashboard: manage logo, subjects, videos per batch
   - Route protection: admin routes require valid session token stored in localStorage
