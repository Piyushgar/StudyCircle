# Railway Deployment Guide for StudyCircle LMS Backend

## Issue Resolution

The "No start command could be found" error has been fixed by restructuring the project for Railway deployment. The solution includes:

1. **Root-level package.json** with all backend dependencies
2. **Proxy server.js** in root that loads the backend
3. **Nixpacks configuration** for proper build process
4. **Railway configuration** for deployment settings

## Files Created/Modified

### 1. `nixpacks.toml` (Nixpacks Configuration)
- Specifies Node.js 18 as the runtime
- Sets up proper install and build phases for the backend
- Defines the correct start command

### 2. `railway.toml` (Railway Configuration)
- Sets Nixpacks as the builder
- Configures the start command
- Sets up health check and restart policies

### 3. `Dockerfile` (Alternative Deployment Method)
- Uses Node.js 18 Alpine image
- Properly copies and installs backend dependencies
- Exposes port 5000 (your backend's default port)

### 4. `package.json` (Root Level)
- Updated with proper start script pointing to backend
- Added engines specification for Node.js and npm versions
- Added build script for Railway

### 5. `.railwayignore`
- Excludes frontend and unnecessary files from deployment
- Reduces deployment size and improves performance

## Deployment Steps

### Option 1: Using the Updated Configuration (Recommended)

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push
   ```

2. **In Railway Dashboard:**
   - Trigger a new deployment
   - Railway should now use the `nixpacks.toml` configuration
   - The build should complete successfully

### Option 2: Using Dockerfile

1. **In Railway Dashboard:**
   - Go to your service settings
   - Under "Deploy", change the builder from "Nixpacks" to "Dockerfile"
   - Trigger a new deployment

### Option 3: Manual Configuration

If the above don't work, you can manually configure Railway:

1. **In Railway Dashboard:**
   - Go to your service settings
   - Under "Deploy" → "Start Command", enter: `cd backend && npm start`
   - Under "Deploy" → "Build Command", enter: `cd backend && npm install`

## Environment Variables

Make sure you have set all required environment variables in Railway:

```
NODE_ENV=production
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
MAIL_HOST=your_mail_host
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
```

## Troubleshooting

### If build still fails:

1. **Check the build logs** in Railway dashboard for specific error messages
2. **Verify environment variables** are set correctly
3. **Try the Dockerfile approach** if Nixpacks continues to have issues
4. **Check your backend dependencies** by running `npm install` locally in the backend folder

### Common Issues:

- **Missing environment variables**: Ensure all required env vars are set in Railway
- **Port conflicts**: Railway automatically assigns PORT, make sure your app uses `process.env.PORT`
- **Database connection**: Verify your MongoDB connection string is correct
- **Memory issues**: Consider upgrading your Railway plan if you hit memory limits

## Port Configuration

Your backend is configured to use:
- `process.env.PORT` (Railway will set this automatically)
- Default fallback: `5000`

Railway will automatically assign a port and set the `PORT` environment variable.

## Next Steps

1. Deploy the backend using one of the methods above
2. Test your API endpoints to ensure they're working
3. Update your frontend's API base URL to point to your Railway deployment
4. Deploy the frontend separately (you can use Vercel, Netlify, or another Railway service)

## Support

If you continue to have issues:
1. Check Railway's deployment logs for specific error messages
2. Verify all environment variables are properly set
3. Try the alternative deployment methods provided above
