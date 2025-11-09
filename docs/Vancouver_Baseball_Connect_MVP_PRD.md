# Vancouver Baseball Connect — MVP Product Requirements Document (PRD)

**Author:** Senior Product Manager (formerly Google)  
**For:** Vancouver Baseball Connect Core Team  
**Date:** November 2025

---

## 1. Overview
The **Vancouver Baseball Connect MVP** is the foundational release of a community-focused baseball management and development platform. It enables players, coaches, coordinators, and parents in **Vancouver Minor Baseball** and **Vancouver Community Baseball** to connect, track progress, and earn recognition through verified stats, training logs, and token-based rewards.

This MVP will be implemented using **Django (Python 3.12)** as the backend framework, with a **REST API layer** for future mobile and third-party integrations.

---

## 2. Goals
- Provide a unified platform for players, coaches, and parents to record and verify progress.
- Introduce verified achievements, player profiles, and basic token rewards.
- Support structured onboarding for different user roles (Player, Coach, Coordinator, Parent).
- Enable easy expansion into mobile and AI features through well-defined REST APIs.

---

## 3. User Roles and Permissions
| Role | Description | Core Capabilities |
|------|--------------|-------------------|
| **Player** | Athlete using the system to track development and showcase progress. | Sign up, join team, edit profile, log training, submit metrics, request coach verification, view achievements, earn tokens. |
| **Coach** | Team leader managing players, approving data, and entering verified stats. | Approve player metrics/logs, create team, invite players, verify videos, grant achievements, issue tokens. |
| **Coordinator** | League-level admin managing divisions and teams. | Approve coaches, monitor activity, review reports, manage token pool and rewards. |
| **Parent** | Guardian or supporter linked to a player account. | View child’s progress, verify training logs, comment on achievements, manage privacy settings. |
| **Admin (System)** | Superuser overseeing entire platform. | Manage users, permissions, tokens, and system settings. |

---

## 4. Core MVP Features

### 4.1 Authentication & Onboarding
**Requirements:**
- User registration via email and password (Django built-in auth system).
- Email verification with activation link.
- Password reset via email.
- Login/logout endpoints and sessions.
- Role selection during signup: *Player*, *Coach*, *Coordinator*, *Parent*.
- Coordinator/admin approval workflow for new teams and coaches.

**User Stories:**
- *As a player*, I can sign up with my email and select my team so I can join my teammates online.
- *As a coach*, I can create or claim a team and invite players.
- *As a coordinator*, I can approve new team creation requests.

---

### 4.2 Team & Division Management
**Requirements:**
- Teams belong to a division (Vancouver Minor Baseball, Vancouver Community Baseball, etc.).
- A player can belong to only one active team per season.
- Coaches manage team rosters (invite/remove players).
- Coordinators can view all teams within their division.

**User Stories:**
- *As a coach*, I can create a team and invite players by email.
- *As a player*, I can request to join my team and wait for coach approval.
- *As a coordinator*, I can view all teams and their rosters.

---

### 4.3 Player Profile
**Requirements:**
- Customizable profile: photo, name, age, position, batting/throwing side, school, bio.
- Player metrics section: fastball velocity, exit velocity, pop time, 60-yard dash.
- Verified metrics have a “✓ Verified” tag.
- Public visibility toggle for each data field.
- Linked YouTube videos (optional, coach-verifiable).

**User Stories:**
- *As a player*, I can customize my profile and control which stats are public.
- *As a coach*, I can verify a player's stat or video.
- *As a parent*, I can review and approve my child’s public profile before publishing.

---

### 4.4 Training Log & Verification
**Requirements:**
- Players can log basic workouts: running, lifting, throwing, batting, etc.
- Each log includes: date, type, duration, notes.
- Verification system: coaches and parents can approve logs.
- Verified logs contribute to achievements and token earnings.
- Analytics: streak tracking, consistency metrics.

**User Stories:**
- *As a player*, I can log my workouts and see my streak.
- *As a coach*, I can verify my player’s training logs.
- *As a parent*, I can confirm my child’s training activity.

---

### 4.5 Achievements & Badges
**Requirements:**
- System awards badges for verified milestones (e.g., “Fastball 80+ MPH”, “10 Training Days in a Row”).
- Coaches can manually assign achievements (e.g., “Team Leader Award”).
- Achievements appear on player dashboards and public profiles.

**User Stories:**
- *As a player*, I can earn badges by meeting verified goals.
- *As a coach*, I can award custom achievements to players.

---

### 4.6 Token System (In-App)
**Requirements:**
- Players earn tokens from achievements, verified logs, or community contributions.
- Tokens tracked in player wallet (non-blockchain).
- Admins/coordinators can adjust token balances.
- Redemption not part of MVP (display only).

**User Stories:**
- *As a player*, I can earn tokens for effort and progress.
- *As a coordinator*, I can monitor token distribution.

---

### 4.7 Role-Based Dashboards
**Requirements:**
- **Player Dashboard:** stats summary, achievements, training log, tokens.
- **Coach Dashboard:** player roster, pending verifications, leaderboard, team notes.
- **Coordinator Dashboard:** overview of all teams, reports, approvals.
- **Parent Dashboard:** linked player profiles, logs awaiting verification.

---

### 4.8 Notifications & Communication
**Requirements:**
- In-app notifications (via Django signals or WebSocket layer for future real-time updates).
- Notification types: log verification requests, approvals, team invites, achievements earned.
- Email notifications for important events (invite, approval, password reset).

**User Stories:**
- *As a player*, I receive a notification when my coach verifies a log.
- *As a coach*, I receive notifications for pending requests.

---

### 4.9 Admin & Coordinator Controls
**Requirements:**
- Admin dashboard for user management, data oversight.
- Coordinator controls for division-level management (teams, coaches, reports).

---

## 5. Data Model Overview (Simplified)
**Entities:**
- `User` (extends Django’s auth model with role field)
- `PlayerProfile` (OneToOne with User)
- `Team`, `Division`
- `TrainingLog` (FK PlayerProfile)
- `PerformanceMetric` (FK PlayerProfile)
- `Achievement` (FK PlayerProfile)
- `TokenTransaction` (FK PlayerProfile)
- `Verification` (FK Coach or Parent → related model)

---

## 6. Technical Requirements
- Framework: Django 5.0, Python 3.12.
- Database: PostgreSQL.
- REST API: Django REST Framework (DRF).
- Authentication: Django allauth or JWT (for mobile readiness).
- Hosting: DigitalOcean Droplet with Nginx + SSL.
- Frontend (MVP web): Django templates + TailwindCSS.
- Testing: Pytest, coverage >80%.

---

## 7. API Endpoints (MVP Scope)
| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/api/auth/register/` | POST | Register user and select role |
| `/api/auth/login/` | POST | Login and return token/session |
| `/api/teams/` | GET/POST | View or create team |
| `/api/players/` | GET | List player profiles (coach view) |
| `/api/profile/` | GET/PUT | View or edit personal profile |
| `/api/training/` | GET/POST | Log and view training entries |
| `/api/metrics/` | GET/POST | Submit player metrics |
| `/api/achievements/` | GET | View earned achievements |
| `/api/tokens/` | GET | View token balance |
| `/api/verify/` | POST | Approve metric, log, or video |

---

## 8. Non-Functional Requirements
- **Security:** Role-based access control enforced on all API endpoints.
- **Scalability:** REST APIs designed for stateless mobile access.
- **Performance:** Page load <2 seconds for standard dashboard views.
- **Reliability:** 99% uptime target on DigitalOcean.
- **Privacy:** Players control what appears publicly; COPPA and PIPEDA compliance for minors.

---

## 9. Future Considerations (Post-MVP)
- Token redemption and marketplace integration.
- AI-based motion analysis.
- Mobile app integration via React Native.
- Blockchain migration for token system (Solana).

---

## 10. Success Metrics
- ≥100 players onboarded within first pilot month.
- ≥80% of users complete verification of first training log.
- ≥5 teams fully active in pilot season.
- ≥90% uptime and <1% signup failure rate.

---

## 11. Summary
The MVP establishes the foundation of **Vancouver Baseball Connect** — a digital bridge between local baseball players, coaches, and families. It focuses on verified performance tracking, achievement recognition, and community engagement, with scalability to expand into mobile, AI, and blockchain ecosystems.
