# News Aggregator API

## Project Overview
The News Aggregator API is designed to fetch and manage news articles from external APIs, allowing users to view articles based on their preferences, mark articles as read, and retrieve their read articles. This API is optimized with caching to reduce external API calls and ensure efficient performance.

### Features
- User authentication and JWT-based authorization.
- Fetch articles based on user preferences.
- Mark articles as read and retrieve read articles.
- Caching mechanism to optimize external API usage.
- Error handling for robust operations.

---

## Installation Instructions

### Prerequisites
- Node.js (v14 or above)
- MongoDB
- An API key from the external news source (e.g., NewsAPI).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/news-aggregator-api.git
   cd news-aggregator-api
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   Create a `.env` file in the root directory and set the following variables:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   NEWS_API_BASE_URL=https://newsapi.org/v2
   NEWS_API_KEY=your_news_api_key
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   The API will be accessible at `http://localhost:4000`.

---

## API Endpoints

### Authentication

#### 1. **Register User**
**POST** `/auth/register`

**Request Body**:
```json
{
  "username": "exampleUser",
  "email": "user@example.com",
  "password": "securePassword",
  "preferences": [
    { "category": "technology", "languages": ["en"] }
  ]
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "username": "exampleUser",
    "email": "user@example.com"
  }
}
```

#### 2. **Login User**
**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_token"
}
```

---

### News

#### 3. **Fetch News**
**GET** `/news`

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response**:
```json
{
  "articles": [
    {
      "id": "unique_article_id",
      "title": "Sample News Title",
      "url": "https://sample.news/url",
      "publishedAt": "2025-01-01T12:00:00Z"
    }
  ]
}
```

#### 4. **Mark Article as Read**
**POST** `/news/:url/read`

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**URL Parameter**:
- `url`: Encoded URL of the article to mark as read.

**Response**:
```json
{
  "message": "Article marked as read successfully"
}
```

#### 5. **Get Read Articles**
**GET** `/news/read`

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response**:
```json
{
  "message": "Read articles retrieved successfully",
  "articles": [
    {
      "title": "Sample News Title",
      "url": "https://sample.news/url",
      "publishedAt": "2025-01-01T12:00:00Z"
    }
  ]
}
```

---

## Caching Mechanism
- Articles fetched from the external API are cached using `node-cache` with a TTL (time-to-live) of 60 seconds.
- Cached data is automatically invalidated after the TTL expires.

---

## Error Handling
The API implements global error handling to return appropriate error messages and HTTP status codes in case of issues. Examples include:
- `401 Unauthorized`: Invalid or missing JWT token.
- `404 Not Found`: User or articles not found.
- `500 Internal Server Error`: Unexpected server errors.

---

## Future Enhancements
- Add pagination support for large data sets.
- Implement advanced filtering and sorting for news articles.
- Enable bookmarking of articles.

