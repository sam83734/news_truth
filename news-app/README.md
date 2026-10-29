# NextTruth Dispatch - React Native (Expo)

This is the complete **React Native (Expo)** port of the NextTruth Native Android (Kotlin + Jetpack Compose) investigative news application.

## 🚀 How to Run Locally

### 1. Install Dependencies
Navigate into this folder and install dependencies:
```bash
cd react-native-app
npm install
```

### 2. Start the Expo Development Server
```bash
npx expo start
```

### 3. Run on Device / Simulator
- **Physical Device:** Open the **Expo Go** app on your Android / iOS phone and scan the QR code displayed in your terminal.
- **Android Emulator:** Press `a` in the terminal.
- **iOS Simulator:** Press `i` in the terminal.
- **Web Preview:** Press `w` in the terminal.

---

## 📱 Features & Exact UI Port

- **Top Header Bar:** Susalabs Logo, "DISPATCH" badge, "Next Truth Investigative Desk", unread notification icon badge, and profile thumbnail.
- **Home Screen:**
  - Dynamic Category Filter pills (`All`, `Urgent`, `Ground Reports`, `Opinion`, `Economics`, `Infrastructure`).
  - Urgent Report Hero card with verified ground badge and "READ FULL" action.
  - "Live on the Ground" horizontal video carousel with live pulsing badges.
  - Sponsored partner card.
  - Opinion column preview card with signature violet vertical accent.
  - Standard news article feed.
  - Floating action button (FAB) for "SUBMIT NEWS".
- **Video Feed Screen:** 16:10 video feed cards with live/replay tags, geolocation pill, interactive likes, and comment sheet triggers.
- **Columns Screen:** Premium editorial column with subscriber paywall fade-out overlay, PayPal subscribe box, author bio, bookmarking, and "More from Sarah Jenkins" article list.
- **Submit News Screen:** Ground submission desk with category selectors, headline & location inputs, eyewitness details textarea, interactive media attachments, and verification desk transmission.
- **Profile Screen:** User profile header with GROUND EXPERT badge, "Support the Truth" banner, Published Reports Bento Grid (Op-Ed, Video Report, Opinion), and Submission Desk tracking with status badges (PENDING, REVISE, APPROVED).
- **Article Detail Reader Sheet:** Full-screen modal reader with audio narration player bar, cover image, full article text, and Ground Verification Audit dossier card.
- **Modals:** Ground Alerts notification dialog & PayPal Premium subscription bottom sheet.
