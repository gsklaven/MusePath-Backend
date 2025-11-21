# MusePath Backend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

That's it! The server will run on **http://localhost:3000** with mock data.

---

## ✅ Test the API

### Health Check
```bash
curl http://localhost:3000/v1/health
```

### Search for Exhibits
```bash
curl "http://localhost:3000/v1/exhibits/search?exhibit_term=starry&mode=online"
```

### Get Exhibit Details
```bash
curl http://localhost:3000/v1/exhibits/1?mode=online
```

### Calculate a Route
```bash
curl -X POST http://localhost:3000/v1/routes \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "destination_id": 2,
    "startLat": 40.7610,
    "startLng": -73.9780
  }'
```

### Rate an Exhibit
```bash
curl -X POST http://localhost:3000/v1/exhibits/1/ratings \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

### Get Personalized Route
```bash
curl http://localhost:3000/v1/users/1/routes
```

### Add to Favorites
```bash
curl -X POST http://localhost:3000/v1/users/1/favourites \
  -H "Content-Type: application/json" \
  -d '{"exhibit_id": 1}'
```

### Update User Preferences
```bash
curl -X PUT http://localhost:3000/v1/users/1/preferences \
  -H "Content-Type: application/json" \
  -d '{"interests": ["modern art", "ancient greece", "sculpture"]}'
```

---

## 📋 All Available Endpoints

**Total: 24 Routes**

### Exhibits (5 routes)
- GET `/v1/exhibits/search` - Search exhibits
- GET `/v1/exhibits/:id` - Get exhibit info
- GET `/v1/exhibits/:id/audio` - Get audio guide
- POST `/v1/exhibits/:id/ratings` - Rate exhibit
- GET `/v1/downloads/exhibits/:id` - Download exhibit

### Routes (5 routes)
- POST `/v1/routes` - Calculate route
- GET `/v1/routes/:id` - Get route details
- PUT `/v1/routes/:id` - Update route
- POST `/v1/routes/:id` - Recalculate route
- DELETE `/v1/routes/:id` - Delete route

### Users (4 routes)
- PUT `/v1/users/:id/preferences` - Update preferences
- POST `/v1/users/:id/favourites` - Add favorite
- DELETE `/v1/users/:id/favourites/:exhibit_id` - Remove favorite
- GET `/v1/users/:id/routes` - Get personalized route

### Destinations (3 routes)
- GET `/v1/destinations` - List all
- POST `/v1/destinations` - Upload destinations
- GET `/v1/destinations/:id` - Get destination info

### Maps (3 routes)
- GET `/v1/maps/:id` - Get map
- POST `/v1/maps` - Upload map
- GET `/v1/downloads/maps/:id` - Download map

### Coordinates (2 routes)
- GET `/v1/coordinates/:user_id` - Get coordinates
- PUT `/v1/coordinates/:user_id` - Update coordinates

### Sync & Notifications (2 routes)
- POST `/v1/sync` - Sync offline data
- POST `/v1/notifications` - Send notification

---

## 🗄️ Optional: Add MongoDB

1. Install MongoDB or get MongoDB Atlas URI
2. Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/musepath
```
3. Restart server

**Without MongoDB:** The API automatically uses mock data!

---

## 🎯 Key Features

✅ 24 fully functional API endpoints  
✅ GET, POST, PUT, DELETE operations  
✅ 7 different entities (Users, Exhibits, Routes, etc.)  
✅ Mock data ready to use  
✅ MongoDB optional  
✅ Complete error handling  
✅ Standard response format  
✅ Input validation  
✅ Rate limiting  
✅ Security headers  

---

## 📱 Response Format

Every endpoint returns:
```json
{
  "success": true/false,
  "data": {...},
  "message": "...",
  "error": null
}
```

---

## 🛠️ Development Mode

```bash
npm run dev
```
Auto-reloads on file changes!

---

## 📖 Full Documentation

See `README.md` for complete API documentation.

---

**🎨 Happy Museum Navigation! 🗺️**
