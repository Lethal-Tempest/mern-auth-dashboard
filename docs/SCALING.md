# Scaling Guide - MERN Auth Dashboard for Production

This document outlines strategies to scale the MERN Auth Dashboard from a development single-server setup to a production-ready, scalable system serving thousands of users.

---

## Current Architecture (Development)
- Single Node.js/Express server
- Local/single MongoDB instance
- No caching, rate limiting, or load balancing
- Tokens stored in browser localStorage
- Basic error handling

---

## Scaling Strategy (8 Areas)

## 1. Authentication & Token Management

### Current State
- JWT tokens stored in browser localStorage (vulnerable to XSS)
- 7-day token expiry
- No token refresh mechanism
- No token blacklisting for logout

### Production Implementation

#### 1a. Refresh Token Pattern
```javascript
// Server: Issue both access & refresh tokens
POST /auth/login
Response: {
  accessToken: "short-lived (15 min)",
  refreshToken: "long-lived (7 days)"
}
```

**Benefits:**
- Short-lived access tokens limit damage from theft
- Refresh token can be revoked server-side
- Better security posture

#### 1b. HttpOnly Cookies
```javascript
// Set refresh token in httpOnly cookie (not accessible to JavaScript)
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true,           // HTTPS only
  sameSite: 'strict',     // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**Benefits:**
- Protects against XSS attacks
- Prevents JavaScript from reading the token
- Automatic CSRF protection with sameSite

#### 1c. Token Refresh Endpoint
```javascript
POST /auth/refresh
Request: (cookies auto-sent)
Response: {
  accessToken: "new-short-lived-token"
}
```

#### 1d. Token Blacklist/Revocation
```javascript
// On logout, add token to blacklist (Redis cache)
POST /auth/logout
Action: Add token to Redis with expiry = remaining token TTL

// On token validation, check if token is blacklisted
GET /users/me
Check: If token in Redis blacklist → reject request
```

**Implementation:**
```bash
npm install redis ioredis
```

---

## 2. Database Optimization

### Current State
- Single MongoDB connection
- No indexes beyond default
- No pagination
- No connection pooling strategy
- Full document returns on every query

### Production Implementation

#### 2a. Indexing Strategy
```javascript
// User model
userSchema.index({ email: 1 }, { unique: true });

// Task model
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, title: "text", description: "text" }); // Text search
```

**Benefits:**
- Query performance: ~100x faster for searches
- Enforces email uniqueness at DB level
- Enables text-based search

#### 2b. Pagination
```javascript
// List tasks with pagination
GET /tasks?page=1&limit=20&search=...&status=...

// Server logic
const limit = Math.min(req.query.limit || 20, 100); // Max 100/page
const skip = (req.query.page - 1) * limit;

const tasks = await Task.find(filter)
  .skip(skip)
  .limit(limit)
  .select('-__v')        // Exclude unnecessary fields
  .lean();                // Lean queries = faster (read-only)

Response: {
  tasks: [],
  total: 1000,
  page: 1,
  pages: 50
}
```

#### 2c. Connection Pooling
```javascript
// Mongoose auto-manages connection pool
// Fine-tune pool size for production
await mongoose.connect(mongoUri, {
  maxPoolSize: 10,           // Default: 10
  minPoolSize: 5,            // Min connections
  socketTimeoutMS: 45000,    // 45 sec timeout
});
```

#### 2d. Field Projection (Don't return unnecessary data)
```javascript
// Instead of returning full document
const user = await User.findById(id);

// Return only needed fields
const user = await User.findById(id).select('name email createdAt');
```

---

## 3. API Performance & Reliability

### Current State
- No rate limiting
- No request logging
- No request compression
- No caching
- Single server = single point of failure

### Production Implementation

#### 3a. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
// config/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 5,                        // 5 requests per window
  message: 'Too many login attempts, try again later'
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,           // 1 minute
  max: 100,                      // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// routes/auth.routes.js
router.post('/login', authLimiter, login);

// app.js
app.use('/api/', apiLimiter);
```

#### 3b. Request Compression
```javascript
import compression from 'compression';

app.use(compression());  // Gzip responses
```

#### 3c. Structured Logging
```bash
npm install winston morgan
```

```javascript
// config/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// middleware
import morgan from 'morgan';
app.use(morgan('combined', { stream: logger.stream }));
```

#### 3d. Caching with Redis
```bash
npm install redis
```

```javascript
// Caching user profile (5 min TTL)
import { createClient } from 'redis';

const redis = createClient();

export async function getMe(req, res) {
  const cacheKey = `user:${req.user.id}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  
  // Query DB
  const user = await User.findById(req.user.id);
  
  // Cache result (5 minutes)
  await redis.setEx(cacheKey, 300, JSON.stringify(user));
  
  return res.json(user);
}
```

---

## 4. Frontend Optimization

### Current State
- Single bundle (no code splitting)
- All pages loaded upfront
- No lazy loading
- No service workers
- Basic error handling

### Production Implementation

#### 4a. Code Splitting with React.lazy
```javascript
// routes.jsx
const Dashboard = React.lazy(() => import('../pages/Dashboard.jsx'));
const Login = React.lazy(() => import('../pages/Login.jsx'));

// In Suspense boundary
<Suspense fallback={<Loading />}>
  <Outlet />
</Suspense>
```

#### 4b. Environment-Based API URLs
```javascript
// .env.production
VITE_API_URL=https://api.primetrade.ai/api

// .env.staging
VITE_API_URL=https://staging-api.primetrade.ai/api

// services/apiClient.js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});
```

#### 4c. Request Retry Logic
```javascript
// services/apiClient.js
apiClient.interceptors.response.use(
  res => res,
  async err => {
    const config = err.config;
    if (!config || !config.retry) config.retry = 0;
    
    config.retry += 1;
    if (config.retry <= 3 && err.response?.status === 500) {
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(r => setTimeout(r, 1000 * 2 ** (config.retry - 1)));
      return apiClient(config);
    }
    
    return Promise.reject(err);
  }
);
```

#### 4d. Error Boundary
```javascript
// components/ErrorBoundary.jsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

// App.jsx
<ErrorBoundary>
  <Outlet />
</ErrorBoundary>
```

#### 4e. Service Workers (Offline Support)
```javascript
// Register service worker for offline caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 5. Deployment Architecture

### Current State
- Single server (localhost)
- No load balancing
- No CDN
- No separate frontend/backend hosting

### Production Implementation

#### 5a. Separate Frontend & Backend Deployment

**Backend Deployment** (AWS EC2 / Heroku / Railway)
```
├── Docker container
├── Environment variables (secrets manager)
├── MongoDB Atlas connection
├── Health checks
└── Auto-scaling groups
```

**Frontend Deployment** (Vercel / Netlify / AWS CloudFront)
```
├── Static files (SPA)
├── CDN distribution
├── Environment-based API URLs
├── SSL/TLS certificates
└── Auto-deployed on git push
```

#### 5b. API Gateway / Reverse Proxy
```nginx
# nginx.conf
upstream backend {
  server api1:5000;
  server api2:5000;
  server api3:5000;
}

server {
  listen 80;
  server_name api.primetrade.ai;
  
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Host $host;
  }
}
```

#### 5c. Database Replication (MongoDB Atlas)
```
Primary (Write) ← Replication → Secondary (Read)
                            ↓
                       Tertiary (Backup)
```

**Benefits:**
- High availability (automatic failover)
- Read scaling (distribute reads across replicas)
- Backups automatically maintained

#### 5d. Load Balancing
```
User Requests
      ↓
[CloudFlare / AWS LB]
      ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  Backend #1     │  Backend #2     │  Backend #3     │
│  (5000)         │  (5000)         │  (5000)         │
└─────────────────┴─────────────────┴─────────────────┘
      ↓           ↓           ↓
   [MongoDB Atlas]  [Redis Cache]  [S3 Storage]
```

---

## 6. Monitoring & Observability

### Current State
- Console logs only
- No alerting
- No performance monitoring
- No uptime tracking

### Production Implementation

#### 6a. Application Performance Monitoring (APM)
```bash
npm install dd-trace  # Datadog
```

```javascript
const tracer = require('dd-trace').init();

tracer.trace('db.query', { resource: 'Task.find' }, () => {
  return Task.find({});
});
```

#### 6b. Error Tracking (Sentry)
```bash
npm install @sentry/node
```

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.errorHandler());
```

#### 6c. Health Checks & Uptime Monitoring
```javascript
// Background job checker
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodb: 'connected',  // Add actual DB check
    redis: 'connected',    // Add actual cache check
  };
  res.json(health);
});

// External monitoring (UptimeRobot, Pingdom)
// Monitors /health endpoint every 5 minutes
```

#### 6d. Metrics & Dashboards
```bash
npm install prom-client  # Prometheus metrics
```

```javascript
import client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_s',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status'],
});
```

---

## 7. Testing & Quality Assurance

### Current State
- No automated tests
- No CI/CD pipeline
- Manual testing only

### Production Implementation

#### 7a. Unit Testing (Jest)
```bash
npm install --save-dev jest @testing-library/react
```

```javascript
// __tests__/validators.test.js
describe('validateLogin', () => {
  test('accepts valid email', () => {
    const errors = validateLogin({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(errors).toEqual({});
  });
  
  test('rejects invalid email', () => {
    const errors = validateLogin({
      email: 'invalid',
      password: 'password123'
    });
    expect(errors.email).toBeDefined();
  });
});
```

#### 7b. Integration Testing
```javascript
// __tests__/api.test.js
describe('POST /auth/register', () => {
  test('registers user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});
```

#### 7c. E2E Testing (Cypress)
```bash
npm install --save-dev cypress
```

```javascript
// cypress/e2e/auth.cy.js
describe('Authentication Flow', () => {
  it('completes registration and login', () => {
    cy.visit('/register');
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button').contains('Create account').click();
    cy.url().should('include', '/dashboard');
  });
});
```

#### 7d. CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/test-deploy.yml
name: Test & Deploy

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci && npm test
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy commands here
          npm run build
          # Push to Vercel/Heroku/AWS
```

---

## 8. Security Hardening

### Current State
- Basic bcrypt hashing
- No HTTPS enforcement
- No CSRF protection
- No security headers
- No dependency scanning

### Production Implementation

#### 8a. HTTPS/TLS Everywhere
```javascript
// Enforce HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

#### 8b. Security Headers
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';

app.use(helmet());  // Sets: CSP, X-Frame-Options, X-Content-Type-Options, etc.
```

#### 8c. CORS Configuration
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### 8d. Input Sanitization
```bash
npm install express-validator xss-clean
```

```javascript
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

app.use(mongoSanitize());  // Prevents NoSQL injection
app.use(xss());             // Prevents XSS attacks
```

#### 8e. Dependency Scanning & Updates
```bash
# GitHub: Enable Dependabot
# Regular npm audit
npm audit
npm audit fix

# Automated PRs for security updates
```

---

## Implementation Roadmap

### Phase 1 (Weeks 1-2): Foundation
- [ ] Implement refresh token pattern
- [ ] Add Redis caching
- [ ] Set up database indexing
- [ ] Add rate limiting

### Phase 2 (Weeks 3-4): Deployment
- [ ] Separate frontend/backend deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure MongoDB Atlas replication
- [ ] Deploy on production infrastructure

### Phase 3 (Weeks 5-6): Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add APM (Datadog)
- [ ] Implement health checks
- [ ] Configure alerting

### Phase 4 (Weeks 7-8): Testing & Security
- [ ] Add unit + integration tests
- [ ] Add E2E tests (Cypress)
- [ ] Implement security headers
- [ ] Perform security audit

---

## Expected Results After Scaling

| Metric | Before | After |
|--------|--------|-------|
| Requests/sec | 10 | 1000+ |
| Response time (p95) | 500ms | <100ms |
| Database queries | Full scan | Indexed (<5ms) |
| Availability | 95% | 99.99% |
| Time to fix issue | 1 hour | 5 minutes (automated alerts) |
| Security score | 70 | 95+ |

---

## Monitoring & Maintenance

**Ongoing tasks:**
- Weekly log review for errors/anomalies
- Monthly dependency updates
- Quarterly security audits
- Bi-annual load testing & capacity planning
- Continuous performance optimization based on metrics

---

## Resources & Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Managed database
- [Redis Cloud](https://redis.com/cloud) - Managed caching
- [Vercel](https://vercel.com) - Frontend deployment
- [Railway](https://railway.app) - Backend deployment
- [GitHub Actions](https://github.com/features/actions) - CI/CD
- [Sentry](https://sentry.io) - Error tracking
- [Datadog](https://www.datadoghq.com) - APM & monitoring
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Security guidelines

---

**Last Updated**: December 2025  
**For**: PrimeTrade.ai Frontend Developer Intern Task
