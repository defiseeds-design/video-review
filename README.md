# 🎬 Video Review Platform

A professional, Frame.io-style video review platform built for content teams. Review, approve, and collaborate on video content before publishing to social media.

![Video Review Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🐦 Twitter-Style Feed
- Videos displayed as realistic Twitter post previews
- See exactly how your content will look when posted
- Verified badge, engagement metrics, and authentic styling

### 📍 Timestamp Comments (Frame.io Style)
- Click anywhere on the video timeline to add comments
- Orange markers show where feedback exists
- Click markers to jump to specific moments
- Comments display with timestamp badges

### 👆 Touch Gestures (Mobile)
- Swipe right to approve videos
- Swipe left to reject
- Pull-to-refresh the feed
- Bottom sheet modals on mobile

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `J` / `K` | Navigate up/down |
| `Enter` | Open selected video |
| `A` | Approve (in modal) |
| `R` | Reject (in modal) |
| `U` | Upload new video |
| `Esc` | Close modal |

### 🔔 Real-time Updates
- Auto-refresh every 30 seconds
- Notification badge for pending feedback
- Toast notifications for all actions
- "Live" indicator when connected

### 📤 Share & Export
- Unique share links for each video
- External reviewers can approve/reject
- "Post to X" button with pre-filled tweet
- One-click video replacement

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/defiseeds-design/video-review.git
cd video-review

# Install dependencies
npm install

# Start the server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 One-Click Deploy

Deploy instantly to your preferred platform:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/defiseeds-design/video-review)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/defiseeds-design/video-review)

## 🛠️ API Reference

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/videos` | List all videos (supports `?sort=date&order=desc`) |
| `GET` | `/api/videos/:id` | Get single video |
| `POST` | `/api/videos` | Upload new video |
| `PATCH` | `/api/videos/:id` | Update status/title/description |
| `PUT` | `/api/videos/:id/file` | Replace video file |
| `DELETE` | `/api/videos/:id` | Delete video |

### Feedback

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/videos/:id/feedback` | Add feedback (supports `timestamp`) |
| `PATCH` | `/api/videos/:id/feedback/:fid` | Update feedback status |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get platform statistics |
| `POST` | `/api/videos/:id/view` | Track video view |

### Share

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/share/:token` | Get video by share token |
| `GET` | `/share/:token` | Public share page |

## 📁 Project Structure

```
video-review/
├── server.js          # Express backend
├── public/
│   ├── index.html     # Main dashboard
│   └── share.html     # Public share page
├── videos/            # Uploaded video files
├── data/
│   └── videos.json    # Video metadata
├── package.json
└── README.md
```

## 🎨 Customization

### Branding

Update the colors in `tailwind.config` within the HTML files:

```javascript
colors: {
  navy: '#1C2951',    // Your primary color
  cyan: '#22D3EE',    // Your accent color
  orange: '#E85D04',  // Your highlight color
  lime: '#D4E157',    // Your CTA color
}
```

### Logo

Replace the logo SVG in the header section:

```html
<div class="tweet-avatar">
  <!-- Your logo SVG here -->
</div>
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome for Android

## 🔒 Security Notes

- No authentication by default (add as needed)
- Share tokens are short UUIDs
- File uploads limited to video/* MIME types
- CORS enabled for API endpoints

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ for [Validator.com](https://validator.com)
