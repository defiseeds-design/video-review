const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/videos', express.static('videos'));

// Data storage
const DATA_FILE = './data/videos.json';

// Ensure directories exist (with error handling for Railway)
['videos', 'data'].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
    // Test write permissions
    const testFile = path.join(dir, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log(`Directory ${dir} is writable`);
  } catch (err) {
    console.error(`Error with directory ${dir}:`, err.message);
  }
});

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ videos: [] }, null, 2));
}

// Helper functions
function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Multer config for video uploads
const storage = multer.diskStorage({
  destination: './videos',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, webm, mov, avi)'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1
  }
});

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  const data = loadData();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    videos: data.videos.length,
    uptime: process.uptime()
  });
});

// Get all videos with optional sorting
app.get('/api/videos', (req, res) => {
  const data = loadData();
  let videos = [...data.videos];
  
  // Sorting
  const { sort, order } = req.query;
  if (sort) {
    videos.sort((a, b) => {
      let valA, valB;
      switch(sort) {
        case 'date': valA = new Date(a.createdAt); valB = new Date(b.createdAt); break;
        case 'title': valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); break;
        case 'status': valA = a.status; valB = b.status; break;
        case 'feedback': valA = (a.feedback || []).length; valB = (b.feedback || []).length; break;
        default: return 0;
      }
      if (order === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
  }
  
  res.json(videos);
});

// Get stats
app.get('/api/stats', (req, res) => {
  const data = loadData();
  const stats = {
    total: data.videos.length,
    pending: data.videos.filter(v => v.status === 'pending').length,
    approved: data.videos.filter(v => v.status === 'approved').length,
    rejected: data.videos.filter(v => v.status === 'rejected').length,
    totalFeedback: data.videos.reduce((sum, v) => sum + (v.feedback || []).length, 0),
    pendingFeedback: data.videos.reduce((sum, v) => sum + (v.feedback || []).filter(f => f.status !== 'addressed').length, 0),
    totalViews: data.videos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalSize: data.videos.reduce((sum, v) => sum + (v.fileSize || 0), 0)
  };
  res.json(stats);
});

// Get single video
app.get('/api/videos/:id', (req, res) => {
  const data = loadData();
  const video = data.videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json(video);
});

// Upload video (file upload)
app.post('/api/videos', (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'Upload failed', message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }
    
    try {
      const data = loadData();
      const video = {
        id: uuidv4(),
        title: req.body.title || 'Untitled',
        description: req.body.description || '',
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status: 'pending',
        feedback: [],
        shareToken: uuidv4().split('-')[0],
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.videos.unshift(video);
      saveData(data);
      console.log('Video uploaded successfully:', video.id);
      res.json(video);
    } catch (saveErr) {
      console.error('Save error:', saveErr);
      res.status(500).json({ error: 'Failed to save video data', message: saveErr.message });
    }
  });
});

// Add video by URL (no file upload needed)
app.post('/api/videos/url', express.json(), (req, res) => {
  const { url, title, description } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Video URL is required' });
  }
  
  try {
    const data = loadData();
    const video = {
      id: uuidv4(),
      title: title || 'Untitled',
      description: description || '',
      videoUrl: url, // External URL instead of local file
      filename: null,
      originalName: null,
      status: 'pending',
      feedback: [],
      shareToken: uuidv4().split('-')[0],
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.videos.unshift(video);
    saveData(data);
    console.log('Video added via URL:', video.id, url);
    res.json(video);
  } catch (err) {
    console.error('Error adding video:', err);
    res.status(500).json({ error: 'Failed to add video', message: err.message });
  }
});

// Track video view
app.post('/api/videos/:id/view', (req, res) => {
  const data = loadData();
  const idx = data.videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video not found' });
  
  data.videos[idx].views = (data.videos[idx].views || 0) + 1;
  saveData(data);
  res.json({ views: data.videos[idx].views });
});

// Update video status
app.patch('/api/videos/:id', (req, res) => {
  const data = loadData();
  const idx = data.videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video not found' });
  
  const { status, title, description } = req.body;
  if (status) data.videos[idx].status = status;
  if (title) data.videos[idx].title = title;
  if (description) data.videos[idx].description = description;
  data.videos[idx].updatedAt = new Date().toISOString();
  
  saveData(data);
  res.json(data.videos[idx]);
});

// Add feedback
app.post('/api/videos/:id/feedback', (req, res) => {
  const data = loadData();
  const idx = data.videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video not found' });
  
  const feedback = {
    id: uuidv4(),
    author: req.body.author || 'Anonymous',
    message: req.body.message,
    timestamp: req.body.timestamp || null,
    status: 'pending', // pending, seen, addressed
    createdAt: new Date().toISOString()
  };
  
  data.videos[idx].feedback.push(feedback);
  data.videos[idx].updatedAt = new Date().toISOString();
  saveData(data);
  
  res.json(feedback);
});

// Mark feedback as seen/addressed
app.patch('/api/videos/:id/feedback/:feedbackId', (req, res) => {
  const data = loadData();
  const vidIdx = data.videos.findIndex(v => v.id === req.params.id);
  if (vidIdx === -1) return res.status(404).json({ error: 'Video not found' });
  
  const fbIdx = data.videos[vidIdx].feedback.findIndex(f => f.id === req.params.feedbackId);
  if (fbIdx === -1) return res.status(404).json({ error: 'Feedback not found' });
  
  const { status, response } = req.body;
  if (status) data.videos[vidIdx].feedback[fbIdx].status = status;
  if (response) data.videos[vidIdx].feedback[fbIdx].response = response;
  data.videos[vidIdx].feedback[fbIdx].addressedAt = new Date().toISOString();
  
  saveData(data);
  res.json(data.videos[vidIdx].feedback[fbIdx]);
});

// Update video file (replace existing video)
app.put('/api/videos/:id/file', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
  
  const data = loadData();
  const idx = data.videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Video not found' });
  }
  
  // Delete old file
  const oldPath = path.join('./videos', data.videos[idx].filename);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  
  // Update record with new file
  data.videos[idx].filename = req.file.filename;
  data.videos[idx].originalName = req.file.originalname;
  data.videos[idx].updatedAt = new Date().toISOString();
  data.videos[idx].status = 'pending'; // Reset to pending for re-review
  
  saveData(data);
  res.json(data.videos[idx]);
});

// Delete video
app.delete('/api/videos/:id', (req, res) => {
  const data = loadData();
  const idx = data.videos.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Video not found' });
  
  // Delete file
  const filePath = path.join('./videos', data.videos[idx].filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  
  data.videos.splice(idx, 1);
  saveData(data);
  res.json({ success: true });
});

// Public share page (by token)
app.get('/share/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'share.html'));
});

// Get video by share token (public API)
app.get('/api/share/:token', (req, res) => {
  const data = loadData();
  const video = data.videos.find(v => v.shareToken === req.params.token);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  
  // Return limited info for public access
  res.json({
    id: video.id,
    title: video.title,
    description: video.description,
    filename: video.filename,
    status: video.status,
    createdAt: video.createdAt
  });
});

// Import existing video (for linking videos already in validator-videos/out)
app.post('/api/videos/import', (req, res) => {
  const { sourcePath, title, description } = req.body;
  
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return res.status(400).json({ error: 'Source file not found' });
  }
  
  const ext = path.extname(sourcePath);
  const newFilename = `${uuidv4()}${ext}`;
  const destPath = path.join('./videos', newFilename);
  
  // Copy file
  fs.copyFileSync(sourcePath, destPath);
  
  const data = loadData();
  const video = {
    id: uuidv4(),
    title: title || path.basename(sourcePath, ext),
    description: description || '',
    filename: newFilename,
    originalName: path.basename(sourcePath),
    status: 'pending',
    feedback: [],
    shareToken: uuidv4().split('-')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.videos.unshift(video);
  saveData(data);
  res.json(video);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong', message: err.message });
});

// 404 handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🎬 Video Review running at http://localhost:${PORT}`);
  console.log(`📁 Videos stored in: ${path.resolve('./videos')}`);
  console.log(`📊 Data file: ${path.resolve(DATA_FILE)}`);
});
