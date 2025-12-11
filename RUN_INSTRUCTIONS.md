# Running the Design Variants

## Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Run Flat Design (Port 3001)
```bash
npm run dev:flat
```
Access at: **http://localhost:3001**

### 3. Run Colorful Design (Port 3002)
```bash
npm run dev:colorful
```
Access at: **http://localhost:3002**

### 4. Run Both Simultaneously
Open two separate terminal windows:
- **Terminal 1**: `npm run dev:flat`
- **Terminal 2**: `npm run dev:colorful`

## Troubleshooting

### If you see "command not found: next"
Run: `npm install`

### If environment variables aren't working
The scripts now use `cross-env` for cross-platform support. If you still have issues:
1. Make sure `cross-env` is installed: `npm install --save-dev cross-env`
2. Check that the scripts in `package.json` use `cross-env`

### If ports are already in use (EADDRINUSE error)
**Quick fix:**
```bash
npm run kill-ports
```

**Manual fix:**
```bash
# Kill port 3001
lsof -ti:3001 | xargs kill -9

# Kill port 3002
lsof -ti:3002 | xargs kill -9
```

Or change the port numbers in `package.json` scripts if you prefer different ports.

### Common Errors

**Error: "Cannot find module"**
- Run `npm install` to install dependencies

**Error: "Port already in use"**
- Stop the other server or change the port number

**Error: "Environment variable not set"**
- Make sure you're using the correct npm script (`dev:flat` or `dev:colorful`)
- Don't use `npm run dev` - use the specific theme scripts

## Verification

After starting a server, you should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3001 (or 3002)
  - Ready in X ms
```

Then open your browser to the URL shown above.
