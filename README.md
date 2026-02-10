# Video Review 🎬

Frame.io-style video review app for Validator.com Twitter content.

## Features

- **Upload videos** - Drag & drop or browse
- **Review & feedback** - Leave comments, timecoded feedback
- **Approve/Reject** - Status workflow
- **Share links** - Public links for clients to view & download
- **Beautiful UI** - Validator.com brand colors

## Quick Start

```bash
cd video-review
npm install
npm start
```

Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get single video |
| POST | `/api/videos` | Upload video (multipart) |
| PATCH | `/api/videos/:id` | Update status/title |
| POST | `/api/videos/:id/feedback` | Add feedback |
| DELETE | `/api/videos/:id` | Delete video |
| POST | `/api/videos/import` | Import existing video |
| GET | `/api/share/:token` | Public video info |

## Share Links

Each video gets a short share token. Clients can view at:
```
http://localhost:3000/share/{token}
```

## Importing Videos

To import an existing video from the validator-videos folder:

```bash
curl -X POST http://localhost:3000/api/videos/import \
  -H "Content-Type: application/json" \
  -d '{"sourcePath": "/path/to/video.mp4", "title": "My Video"}'
```

## File Structure

```
video-review/
├── public/
│   ├── index.html      # Dashboard
│   └── share.html      # Public share page
├── videos/             # Uploaded video files
├── data/
│   └── videos.json     # Video metadata
├── server.js           # Express API
└── package.json
```

## Brand Colors

- Navy: #1C2951
- Cyan: #22D3EE
- Orange: #E85D04
- Lime: #D4E157
