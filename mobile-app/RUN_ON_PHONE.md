# 📱 Run Mobile App on Your Phone

## ✅ Prerequisites Done
- ✅ Your computer's IP: **172.27.1.164**
- ✅ API configured to use IP address
- ✅ Backend running on port 3000

---

## 📲 Step-by-Step Guide

### Step 1: Install Expo Go on Your Phone

**iPhone:**
1. Open **App Store**
2. Search for **"Expo Go"**
3. Install the app

**Android:**
1. Open **Play Store**
2. Search for **"Expo Go"**
3. Install the app

---

### Step 2: Make Sure You're on the Same WiFi

⚠️ **CRITICAL:** Your phone and computer MUST be on the same WiFi network!

Check your WiFi:
- **Computer:** You're on the network with IP 172.27.1.164
- **Phone:** Make sure it's connected to the SAME WiFi network

---

### Step 3: Start the Expo Server

The Expo server should already be running. If not, run:

```bash
cd c:\Users\USER\Downloads\Flavour_Garden-main\Flavour_Garden-main\mobile-app
npx expo start
```

You'll see a **QR code** in the terminal.

---

### Step 4: Scan the QR Code

**For iPhone:**
1. Open the **Camera** app (built-in camera)
2. Point it at the QR code in your terminal
3. A notification will appear at the top
4. **Tap the notification**
5. Expo Go opens automatically!

**For Android:**
1. Open the **Expo Go** app
2. Tap **"Scan QR Code"**
3. Point camera at the QR code
4. App starts building!

---

### Step 5: Wait for the App to Load

First time loading takes 30-60 seconds:
- You'll see "Building JavaScript bundle..."
- Progress bar appears
- Then the login screen loads! 🎉

---

## 🧪 Test the App on Your Phone

Once loaded, test everything:

1. **Login** with test credentials:
   - Email: `jane.smith@example.com`
   - Password: `password123`

2. **Navigate tabs:**
   - Home → See your greeting
   - Menu → Browse food items
   - Cart → Empty cart
   - Orders → Order history
   - Profile → Your info

3. **Add items to cart:**
   - Go to Menu tab
   - Tap category filters
   - Tap "ADD" on items
   - Watch cart badge update

4. **View cart:**
   - Go to Cart tab
   - See your items
   - Use +/- buttons
   - Check bill total

---

## 🔥 Hot Reload

When you save code changes:
- The app **automatically reloads** on your phone!
- No need to rebuild or restart

---

## 🐛 Troubleshooting

### "Unable to connect to server"
- ✅ Check: Phone on same WiFi as computer?
- ✅ Check: Backend running at `http://172.27.1.164:3000`?
- ✅ Try: Restart the Expo server

### "Network request failed"
- ✅ Check: Firewall blocking port 3000?
- ✅ Try: Temporarily disable Windows Firewall
- ✅ Check: Backend logs for CORS errors

### QR Code not scanning
- ✅ Try: Type the URL manually in Expo Go:
  - Look for `exp://172.27.1.164:8081` in terminal
  - Enter this in Expo Go app

### App crashes or errors
- ✅ Check: Expo terminal for error messages
- ✅ Try: Shake phone → Reload
- ✅ Try: Restart Expo server

---

## 🎯 Current Limitations

Since the app is in development mode:
- App connects to your local backend (not a deployed server)
- Both devices must be on same WiFi
- Won't work if you leave your home network

**For production deployment** (later):
- Deploy backend to Vercel/Railway
- Build standalone APK/IPA
- Publish to App Store/Play Store

---

## 🚀 Next Steps After Testing

Once you confirm it works on your phone:
1. Test all features
2. Add more advanced features
3. Build for production
4. Deploy backend
5. Submit to app stores

Enjoy testing your app on your phone! 📱✨
