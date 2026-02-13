# Key Implementation Details

## 1. Redux Store with DevTools

```javascript
// client/src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
// ... other reducers

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    // ... other slices
  },
  devTools: {
    trace: true,
    traceLimit: 25,
  },
});
```

## 2. Authentication Setup

### Passport Configuration

```javascript
// server/configs/passport.js
import passport from "passport";
import LocalStrategy from "passport-local";
import JWTStrategy from "passport-jwt";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// Local Strategy - for login
passport.use(
  "local",
  new LocalStrategy.Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      // Find user and verify password
    },
  ),
);

// JWT Strategy - for protecting API routes
passport.use(
  "jwt",
  new JWTStrategy.Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      // Verify JWT and fetch user
    },
  ),
);
```

### Authentication Middleware

```javascript
// server/middlewares/auth.js
export const auth = passport.authenticate("jwt", { session: false });

export const attachPlanInfo = async (req, res, next) => {
  // Check if user has premium subscription
  // Attach plan info to req.plan
};
```

## 3. Async Thunk Actions

```javascript
// client/src/redux/slices/authSlice.js
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

// In component
const handleLogin = async () => {
  const result = await dispatch(loginUser(formData)).unwrap();
  // result.token and result.user available
};
```

## 4. Protected Routes

```javascript
// server/server.js
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Public auth routes
app.use("/api/auth", authRouter);

// Protected routes
app.use(auth); // Verify JWT token
app.use(attachPlanInfo); // Attach plan info
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);
```

## 5. Using Redux in Components

```javascript
// client/src/components/Plan.jsx
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserPlan, upgradePlan } from '../redux/slices/userSlice'

const Plan = () => {
  const dispatch = useDispatch()
  const { plan, isLoading } = useSelector(state => state.user)
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserPlan())
    }
  }, [isAuthenticated])

  const handleUpgrade = (planType) => {
    dispatch(upgradePlan(planType))
      .unwrap()
      .then(() => toast.success('Upgraded!'))
      .catch((error) => toast.error(error))
  }

  return (
    // Display current plan
    // Show plan options
  )
}
```

## 6. Extractors for Protected Data

```javascript
// Extracting user from request
// OLD (Clerk):
const { userId } = req.auth();

// NEW (Passport):
const userId = req.user.id;

// Checking admin status
// OLD (Clerk):
const user = await clerkClient.users.getUser(userId);
const isAdmin = user.publicMetadata?.isAdmin;

// NEW (Passport):
const user = await sql("SELECT is_admin FROM users WHERE id = $1", [userId]);
const isAdmin = user[0]?.is_admin;
```

## 7. API Call Pattern with Redux

```javascript
// Pattern for making API calls with Redux
export const someApiCall = createAsyncThunk(
  "feature/someApiCall",
  async ({ param1, param2 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/endpoint`,
        { param1, param2 },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Action failed");
    }
  },
);

// In extraReducers
extraReducers: (builder) => {
  builder
    .addCase(someApiCall.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(someApiCall.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    })
    .addCase(someApiCall.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
};
```

## 8. Token Verification on App Load

```javascript
// client/src/App.jsx
import { verifyToken } from './redux/slices/authSlice'

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Verify stored token on app load
    dispatch(verifyToken())
  }, [dispatch])

  return (
    // App routes
  )
}
```

## 9. Login/Signup Form Pattern

```javascript
// client/src/pages/Login.jsx
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(formData)).unwrap();
      toast.success("Login successful!");
      navigate("/ai");
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <button disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};
```

## 10. Admin Check in Controllers

```javascript
// server/controllers/adminController.js
const checkAdminStatus = async (userId) => {
  const user = await sql("SELECT is_admin FROM users WHERE id = $1", [userId]);
  return user.length > 0 && user[0].is_admin === true;
};

export const someAdminRoute = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = await checkAdminStatus(userId);

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  // Admin-only logic
};
```

## 11. Password Hashing

```javascript
// server/configs/passport.js
import bcryptjs from 'bcryptjs'

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

// In signup route
const passwordHash = await hashPassword(password)
await sql(
  'INSERT INTO users (..., password_hash) VALUES (..., $1, ...)',
  [..., passwordHash, ...]
)
```

## 12. JWT Token Generation

```javascript
// server/configs/passport.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "your_secret_key",
    { expiresIn: "7d" },
  );
};

// In login route
const token = generateToken(user);
res.json({
  success: true,
  token,
  user: { id: user.id, email: user.email },
});
```

## 13. Database Query Pattern Change

```javascript
// OLD (Template literals with Neon):
const users = await sql`SELECT * FROM users WHERE id = ${userId}`;

// NEW (Parameterized queries):
const users = await sql("SELECT * FROM users WHERE id = $1", [userId]);

// Accessing results
const user = users[0]; // Array result
```

## 14. Error Handling Pattern

```javascript
// Consistent error handling
export const someRoute = async (req, res) => {
  try {
    const result = await someAsyncOperation();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// In components
dispatch(someAction())
  .unwrap()
  .then((result) => {
    toast.success("Success!");
  })
  .catch((error) => {
    toast.error(error || "Failed");
  });
```

## 15. Redux State Structure

```javascript
// Auth state
{
  auth: {
    user: { id, email, firstName, lastName },
    token: 'JWT_TOKEN',
    isLoading: false,
    error: null,
    isAuthenticated: true
  },

  // User state
  user: {
    userData: { id, email, ... },
    plan: {
      type: 'premium', // or 'free'
      exists: true,
      credits: 100
    },
    isLoading: false,
    error: null
  },

  // Other feature states follow similar pattern
  ai: {
    data: null,
    isLoading: false,
    error: null,
    success: false
  }
}
```

---

This document provides reference implementations for all major components of the migration.
