# 🏛️ MusePath Backend

> Interactive museum maps, exhibit details, and personalized navigation REST API

## 📋 Περιεχόμενα

- [Περιγραφή](#περιγραφή)
- [Χαρακτηριστικά](#χαρακτηριστικά)
- [Τεχνολογίες](#τεχνολογίες)
- [Εγκατάσταση](#εγκατάσταση)
- [Εκτέλεση](#εκτέλεση)
- [API Documentation](#api-documentation)
- [Δομή Project](#δομή-project)
- [Mock Data](#mock-data)

## 📖 Περιγραφή

Το MusePath Backend είναι ένα RESTful API που παρέχει λειτουργίες για:
- Διαδραστικούς χάρτες μουσείων
- Πληροφορίες εκθεμάτων
- Εξατομικευμένη πλοήγηση
- Offline mode support
- Διαχείριση χρηστών και προτιμήσεων

## ✨ Χαρακτηριστικά

- ✅ **24 RESTful Endpoints** - Πλήρες CRUD API
- ✅ **7 Entities** - Users, Exhibits, Routes, Maps, Destinations, Coordinates, Notifications
- ✅ **Mock Data Fallback** - Λειτουργεί χωρίς MongoDB
- ✅ **MVC Architecture** - Καθαρός και συντηρήσιμος κώδικας
- ✅ **Error Handling** - Centralized error management
- ✅ **Input Validation** - Ασφαλής επεξεργασία δεδομένων
- ✅ **Security** - Helmet, CORS, Rate limiting
- ✅ **Compression** - Optimized responses

## 🛠️ Τεχνολογίες

- **Node.js** (v18+)
- **Express.js** (v4.18.2)
- **MongoDB** (v8.0.3) - Optional
- **Mongoose** (v8.0.3)
- **dotenv** (v16.3.1)
- **cors** (v2.8.5)
- **helmet** (v7.1.0)
- **express-rate-limit** (v7.1.5)
- **compression** (v1.7.4)
- **morgan** (v1.10.0)

## 📦 Εγκατάσταση

### Προαπαιτούμενα

- Node.js 18+ ([Κατέβασμα](https://nodejs.org/))
- npm ή yarn
- MongoDB (προαιρετικό)

### Βήματα Εγκατάστασης

1. **Clone το repository**
   ```bash
   git clone <repository-url>
   cd MusePath-Backend
   ```

2. **Εγκατάσταση dependencies**
   ```bash
   npm install
   ```

3. **Δημιουργία .env αρχείου** (προαιρετικό)
   ```bash
   # Αντιγραφή του .env.example
   cp .env.example .env
   ```

4. **Ρύθμιση περιβάλλοντος** (προαιρετικό)
   ```env
   # .env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/musepath
   NODE_ENV=development
   ```

## 🚀 Εκτέλεση

### Development Mode

```bash
# Εκκίνηση με auto-reload
npm run dev
```

### Production Mode

```bash
# Εκκίνηση server
npm start
```

### Επιβεβαίωση λειτουργίας

Ανοίξτε το browser στο: `http://localhost:3000/v1/health`

Θα δείτε:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-11-28T10:00:00.000Z",
    "version": "1.0.0"
  },
  "message": "MusePath API is running",
  "error": null
}
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/v1
```

### Endpoints Overview

#### 🏥 Health Check
- `GET /health` - API status check

#### 🎨 Exhibits (7 endpoints)
- `GET /exhibits/search` - Αναζήτηση εκθεμάτων
- `GET /exhibits/:id` - Λεπτομέρειες εκθέματος
- `GET /exhibits/:id/audio` - Audio guide
- `POST /exhibits/:id/ratings` - Αξιολόγηση εκθέματος
- `POST /exhibits` - Δημιουργία εκθέματος (admin only)
- `DELETE /exhibits/:id` - Διαγραφή εκθέματος (admin only)
- `GET /downloads/exhibits/:id` - Download για offline

#### 🗺️ Routes (5 endpoints)
- `POST /routes` - Δημιουργία διαδρομής
- `GET /routes/:id` - Λεπτομέρειες διαδρομής
- `PUT /routes/:id` - Ενημέρωση στάσεων
- `POST /routes/:id` - Επαναυπολογισμός
- `DELETE /routes/:id` - Διαγραφή διαδρομής

#### 👤 Users (4 endpoints)
- `PUT /users/:id/preferences` - Ενημέρωση προτιμήσεων
- `POST /users/:id/favourites` - Προσθήκη αγαπημένου
- `DELETE /users/:id/favourites/:eid` - Αφαίρεση αγαπημένου
- `GET /users/:id/routes` - Εξατομικευμένη διαδρομή

#### 🗺️ Maps (3 endpoints)
- `POST /maps` - Upload χάρτη
- `GET /maps/:id` - Λήψη χάρτη
- `GET /downloads/maps/:id` - Download χάρτη

#### 📍 Destinations (4 endpoints)
- `GET /destinations` - Λίστα προορισμών
- `POST /destinations` - Upload προορισμών (admin only)
- `GET /destinations/:id` - Πληροφορίες προορισμού
- `DELETE /destinations/:id` - Διαγραφή προορισμού (admin only)

#### 📍 Coordinates (2 endpoints)
- `GET /coordinates/:user_id` - Τοποθεσία χρήστη
- `PUT /coordinates/:user_id` - Ενημέρωση τοποθεσίας

#### 🔔 Notifications & Sync (2 endpoints)
- `POST /notifications` - Αποστολή ειδοποίησης
- `POST /sync` - Συγχρονισμός offline data

### Παράδειγμα Χρήσης

#### Δημιουργία Διαδρομής
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

#### Αναζήτηση Εκθεμάτων
```bash
curl "http://localhost:3000/v1/exhibits/search?exhibit_term=starry&mode=online"
```

#### Αξιολόγηση Εκθέματος
```bash
curl -X POST http://localhost:3000/v1/exhibits/1/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5
  }'
```

## 📁 Δομή Project

```
MusePath-Backend/
├── app.js                    # Express app configuration
├── server.js                 # Server entry point
├── package.json              # Dependencies
├── .env.example              # Environment template
│
├── config/                   # Configuration files
│   ├── constants.js          # App constants
│   └── database.js           # MongoDB connection
│
├── controllers/              # Request handlers (8 files)
│   ├── coordinateController.js
│   ├── destinationController.js
│   ├── exhibitController.js
│   ├── mapController.js
│   ├── notificationController.js
│   ├── routeController.js
│   ├── syncController.js
│   └── userController.js
│
├── services/                 # Business logic (8 files)
│   ├── coordinateService.js
│   ├── destinationService.js
│   ├── exhibitService.js
│   ├── mapService.js
│   ├── notificationService.js
│   ├── routeService.js
│   ├── syncService.js
│   └── userService.js
│
├── models/                   # MongoDB schemas (7 files)
│   ├── Coordinate.js
│   ├── Destination.js
│   ├── Exhibit.js
│   ├── Map.js
│   ├── Notification.js
│   ├── Route.js
│   └── User.js
│
├── routes/                   # API routes (10 files)
│   ├── index.js              # Main router
│   ├── coordinates.js
│   ├── destinations.js
│   ├── exhibits.js
│   ├── maps.js
│   ├── routes.js
│   ├── users.js
│   ├── notifications.js
│   ├── sync.js
│   └── downloads.js
│
├── middleware/               # Express middleware (4 files)
│   ├── auth.js               # Authentication
│   ├── validation.js         # Input validation
│   ├── errorHandler.js       # Error handling
│   └── logger.js             # Request logging
│
├── utils/                    # Helper functions (3 files)
│   ├── responses.js          # Standard responses
│   ├── validators.js         # Validation helpers
│   └── helpers.js            # General helpers
│
├── data/                     # Mock data
│   └── mockData.js           # Hardcoded test data
│
└── docs/                     # Documentation
    ├── swagger.json
    ├── requirements-project-2025-11-20.json
    └── stories-musepath-se2-2025-11-20.json
```

## 🗄️ Mock Data

Το API λειτουργεί **αυτόματα με mock data** όταν δεν υπάρχει MongoDB σύνδεση.

### Διαθέσιμα Mock Data

- **3 Users** - Με preferences, favourites, ratings
- **5 Exhibits** - Πλήρεις πληροφορίες, audio guides, ratings
- **2 Maps** - Ground floor & First floor
- **6 Destinations** - Exhibits, restrooms, cafe, entrance
- **3 Coordinates** - User locations
- **1 Route** - Sample route with instructions
- **1 Notification** - Route deviation alert

### Πρόσβαση στα Mock Data

Τα mock data είναι άμεσα διαθέσιμα μέσω όλων των endpoints:

```bash
# Λήψη όλων των εκθεμάτων
GET http://localhost:3000/v1/exhibits/search?mode=online

# Λεπτομέρειες συγκεκριμένου εκθέματος
GET http://localhost:3000/v1/exhibits/1

# Λίστα προορισμών
GET http://localhost:3000/v1/destinations
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `MONGODB_URI` | - | MongoDB connection string (optional) |
| `NODE_ENV` | development | Environment mode |
| `DEFAULT_WALKING_SPEED` | 5 | Walking speed in km/h |
| `ROUTE_DEVIATION_THRESHOLD` | 50 | Deviation alert threshold (meters) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |

## 🛡️ Security Features

- ✅ **Helmet.js** - Security headers
- ✅ **CORS** - Cross-origin resource sharing
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Input Validation** - Request sanitization
- ✅ **Error Sanitization** - Safe error messages
- ✅ **Size Limits** - 10MB request limit

## 📊 Response Format

Όλα τα endpoints επιστρέφουν standard format:

```json
{
  "success": true|false,
  "data": { ... },
  "message": "Descriptive message",
  "error": null|"Error description"
}
```

### Success Response
```json
{
  "success": true,
  "data": {
    "exhibit_id": 1,
    "name": "The Starry Night",
    "category": ["paintings", "modern art"]
  },
  "message": "Exhibit retrieved successfully",
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Exhibit not found",
  "error": "EXHIBIT_NOT_FOUND"
}
```

## 🧪 Testing

### Automated Test Suite

Το API περιλαμβάνει **206 comprehensive tests** που καλύπτουν όλα τα endpoints:

```bash
# Εκτέλεση όλων των tests
npm test

# Εκτέλεση με coverage report (terminal)
npm run test:coverage

# Δημιουργία HTML coverage report
npm run test:coverage:html
```

**Test Coverage:**
- 4 Basic tests (health, routing)
- 47 Authentication tests (register, login, logout, validation)
- 29 Exhibit tests (CRUD, ratings, admin operations, offline mode)
- 20 Coordinate tests (location tracking, validation)
- 24 Route tests (calculation, navigation, personalization)
- 21 Destination tests (CRUD, admin operations)
- 18 Map tests (CRUD, admin operations, offline support)
- 20 User tests (preferences, favorites, personalized routes)
- 23 Additional integration tests

Το HTML coverage report δημιουργείται στο `coverage/index.html` και δείχνει:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

### Μέθοδος 1: API Test Page (Recommended) 🌟
Χρησιμοποιήστε την ενσωματωμένη σελίδα testing:

1. Ξεκινήστε το Backend: `npm start`
2. Ξεκινήστε το Frontend: `cd ../MusePath-Frontend && npm start`
3. Ανοίξτε: `http://localhost:3001/api-test`
4. Πατήστε "Test All Endpoints" για automated testing

**Χαρακτηριστικά:**
- ✅ Δοκιμή όλων των 24 endpoints με ένα κλικ
- ✅ Real-time response display
- ✅ Response time tracking
- ✅ Connection status check
- ✅ Beautiful UI με categorized endpoints

Δείτε το [API Test Guide](../MusePath-Frontend/API-TEST-GUIDE.md) για περισσότερες πληροφορίες.

### Μέθοδος 2: Command Line
```bash
# Test Health Endpoint
curl http://localhost:3000/v1/health

# Test Get Exhibits
curl "http://localhost:3000/v1/exhibits/search?exhibit_term=starry"

# Test Create Route
curl -X POST http://localhost:3000/v1/routes \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"destination_id":2,"startLat":40.7610,"startLng":-73.9780}'
```

### Μέθοδος 3: Postman
Εισάγετε το `docs/swagger.json` στο Postman για έτοιμη collection.

## 📝 Scripts

```json
{
  "start": "node server.js",              // Production
  "dev": "node --watch server.js",        // Development with auto-reload
  "test": "ava",                           // Run all tests (127 tests)
  "test:coverage": "c8 ava",               // Run tests with coverage report
  "test:coverage:html": "c8 --reporter=html --reporter=text ava"  // HTML coverage report
}
```

## 🐛 Troubleshooting

### Το server δεν ξεκινάει

**Πρόβλημα:** Port 3000 already in use

**Λύση:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### MongoDB connection error

**Πρόβλημα:** Cannot connect to MongoDB

**Λύση:** Το API θα χρησιμοποιήσει αυτόματα mock data. Δεν χρειάζεται action.

### Module not found error

**Πρόβλημα:** Cannot find module 'express'

**Λύση:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 👥 Authors

- Software Engineering Team 2
- Aristotle University of Thessaloniki

## 📄 License

ISC License

## 🔗 Links

- [Frontend Repository](../MusePath-Frontend)
- [API Documentation](./docs/swagger.json)
- [Requirements](./docs/requirements-project-2025-11-20.json)
- [User Stories](./docs/stories-musepath-se2-2025-11-20.json)

---

**💡 Tip:** Για πλήρη documentation των endpoints, ελέγξτε το αρχείο `QUICKSTART.md` ή το `IMPLEMENTATION_SUMMARY.md`.
