# EduNutrition — API Endpoints

Base URL: `http://localhost:4000/api` (dev). All routes except `/auth/signup` and
`/auth/login` require `Authorization: Bearer <supabase_access_token>`.

## Auth

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register (creates `auth.users` + `profiles` row) |
| POST | `/auth/login` | Public | Login, delegated to Supabase — returns session tokens |
| POST | `/auth/logout` | Authenticated | Revoke current session |
| GET | `/auth/me` | Authenticated | Current user + profile (from JWT) |

## Modules

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/modules` | Authenticated | List published modules, filterable by `?level=&category=` |
| GET | `/modules/:id` | Authenticated | Module detail incl. lessons |
| POST | `/modules` | admin, teacher, nurse | Create a module |
| PUT | `/modules/:id` | admin, teacher, nurse (owner) | Edit a module |
| DELETE | `/modules/:id` | admin, teacher, nurse (owner) | Delete a module |
| POST | `/modules/:id/publish` | admin, teacher, nurse (owner) | Toggle `published` |

### Lessons (nested under a module)

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/modules/:id/lessons` | Authenticated | List lessons for a module, ordered by `order_num` |
| POST | `/modules/:id/lessons` | admin, teacher, nurse | Add a lesson (video + markdown content) |
| PUT | `/modules/:id/lessons/:lessonId` | admin, teacher, nurse | Edit a lesson |
| DELETE | `/modules/:id/lessons/:lessonId` | admin, teacher, nurse | Delete a lesson |

### Quizzes (nested under a lesson)

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/modules/:id/lessons/:lessonId/quiz` | Authenticated | Fetch quiz questions for a lesson |
| PUT | `/modules/:id/lessons/:lessonId/quiz` | admin, teacher, nurse | Create/replace quiz questions (JSONB) |
| POST | `/modules/:id/lessons/:lessonId/quiz/submit` | Authenticated | Submit answers, returns score, writes to `progress` |

## Progress

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/progress/me` | Authenticated | Current user's progress across all modules |
| POST | `/progress` | Authenticated | Mark a lesson `completed` (upsert on `user_id, lesson_id`) |

## Schools

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/schools/:id` | Own school | School profile (name, canton, tier, student_count) |
| PUT | `/schools/:id` | admin (own school) | Update school profile |
| GET | `/schools/:id/students` | admin, teacher, nurse | List students enrolled in the school |
| GET | `/schools/:id/subscription` | admin (own school) | Current subscription tier + limits |

## Users

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/users` | admin | List users in own school |
| POST | `/users/invite` | admin | Generate an invite link for a new user (email + role) |
| PUT | `/users/:id` | self, or admin (own school) | Update profile fields (name, role) |
| DELETE | `/users/:id` | admin (own school) | Remove a user from the school |

## Analytics

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/analytics/student/:id` | self, admin, teacher, nurse | Completion %, quiz scores, time spent for one student |
| GET | `/analytics/school/:id` | admin, teacher, nurse | Aggregated, anonymized school-level completion rates |
| GET | `/analytics/school/:id/export` | admin | CSV export of school analytics |

## Billing (Tier 4)

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/billing/checkout` | admin | Create a Stripe Checkout session for a subscription tier |
| POST | `/billing/webhook` | Stripe (signed) | Handle `checkout.session.completed`, `customer.subscription.updated/deleted` |

---

### Implementation status

- ✅ Auth routes implemented ([authController.ts](../backend/src/controllers/authController.ts))
- ✅ Modules/Lessons/Quizzes/Progress implemented
  ([modulesController.ts](../backend/src/controllers/modulesController.ts),
  [lessonsController.ts](../backend/src/controllers/lessonsController.ts),
  [quizzesController.ts](../backend/src/controllers/quizzesController.ts),
  [progressController.ts](../backend/src/controllers/progressController.ts)) — `GET /modules`
  computes `progress_percent` per module for the caller; quiz submission writes to `progress` and
  returns a score. Access control is enforced in the controllers (service-role key bypasses RLS,
  so ownership/role checks happen in app code, not the database).
- ✅ Schools/Users/Analytics implemented
  ([schoolsController.ts](../backend/src/controllers/schoolsController.ts),
  [usersController.ts](../backend/src/controllers/usersController.ts),
  [analyticsController.ts](../backend/src/controllers/analyticsController.ts)). Notes:
  - `POST /users/invite` uses `supabase.auth.admin.inviteUserByEmail` — requires SMTP/email
    configured in the Supabase project to actually deliver the invite.
  - School analytics only counts lessons whose parent module is `published`; per-student rows
    are only ever returned from the CSV export (admin-only), never from the JSON endpoint.
  - "Time spent" on student analytics is a proxy (sum of `duration_minutes` for fully-completed
    modules) — there's no per-lesson time tracking in the schema yet.
- ⬜ Billing routes not yet scaffolded (Tier 4).

All async route handlers are wrapped in [asyncHandler.ts](../backend/src/middleware/asyncHandler.ts) —
Express 4 does not catch promise rejections from `async` handlers on its own, so without this
wrapper a thrown `ZodError` or Supabase error crashes the process instead of returning a 4xx/5xx.
