# ZYX Video Call App 📞🚀

ZYX Video Call is a real-time, responsive video conferencing and instant messaging web platform built to connect people seamlessly. Utilizing WebRTC for peer-to-peer media streaming and WebSockets for signaling, the application offers high-quality video rooms, screen-sharing capabilities, and a fully interactive workspace accessible across both desktop and mobile layouts.

---

## ✨ Features

* **Secure Authentication:** Quick registration and login portal backed by JSON Web Tokens (JWT) stored safely client-side. Includes a friction-free **Join as Guest** workspace shortcut.
* **Real-Time Video Conferences:** Instant multi-user video grids powered by secure mesh networking (`RTCPeerConnection` + Google STUN servers).
* **Adaptive Media Controls:** Synchronous local toggles for camera mute/unmute and microphone management with intuitive user interfaces.
* **Screen Sharing:** Native desktop browser desktop-casting directly into live meeting rooms.
* **Collapsible In-Room Chat:** Seamless cross-client communication drawer using Socket.io messaging pipelines.
* **Meeting History Log:** Complete retrospective dashboard keeping users updated on their active call log milestones.
* **100% Fully Responsive Layout:** Dynamically collapses grids, controls, and sliders perfectly onto small mobile viewport screens.

---

## 🛠️ Tech Stack

### Frontend
* **React (v18+)** — Component-driven core layout.
* **Material-UI (MUI)** — Design layout grid library systems and asset icons.
* **Socket.io-Client** — Real-time event communication pipelines.
* **React Router DOM** — Managed single-page view transitions.
* **Axios** — Promised-based client REST resource operations configuration layer.

### Backend
* **Node.js & Express.js** — Fast RESTful routing application engine.
* **Socket.io** — WebSocket server orchestration layer.
* **MongoDB & Mongoose** — Document-oriented identity validation models and history logs.
* **jsonwebtoken (JWT)** — Stateless cryptographically secured middleware authorization verifiers.

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed locally:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Local instance or Atlas Connection string URI)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/zyx-video-call.git](https://github.com/your-username/zyx-video-call.git)
cd zyx-video-call