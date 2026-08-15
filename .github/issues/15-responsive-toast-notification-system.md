# [Frontend] Responsive Agile Toast Notification & Feedback System

**Repository:** `AgroLock/agrolock`  
**Labels:** `frontend`, `ui/ux`, `enhancement`, `medium`

---

## Description

Users currently rely on static inline messages or generic text strings for wallet authentication status, transaction confirmations, clipboard actions, and network events. This lacks real-time agile feedback and visual polish on mobile and desktop devices.

## Proposed Resolution

1. Create a global `ToastContext` provider managing animated toast notifications (`success`, `error`, `info`, `warning`).
2. Add smooth glassmorphism styling, entrance/exit animations, progress indicators, and auto-dismiss capabilities in `index.css`.
3. Integrate `ToastProvider` into `App.jsx` and `Layout.jsx`.
4. Expose `useToast` hook for seamless feedback on transactions and user interactions across the application.
