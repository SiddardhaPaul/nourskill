# Nourskill

An online learning marketplace organized around an **Upskilling Tree**: learners move from a department to a category, a focus stream, and finally an individual course.

## Run the React app

This project is now a Vite + React app for the Nourskill concept site.

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Then open http://localhost:5173 in the browser.

The app includes the department landing pages, category and stream navigation, searchable course catalog, and dashboard views for learner, instructor, and admin flows. The data is backed by a larger taxonomy dataset in `src/data/treeData.js` and the UI is rendered from `src/App.jsx`.

The basket does not collect payment. Course playback, account sign-in, certificates, instructor payouts, moderation permissions, and persistent records also require the production services described below.

## Information architecture

```text
Upskilling Tree (root / catalog)
├── Technical & Engineering
│   ├── Software Support → Technical Support, IT Service Desk, Systems Administration
│   ├── Engineering Support → CAD & Drafting, Quality Assurance, Maintenance Engineering
│   ├── AI → Generative AI, Computer Vision, Natural Language Processing, MLOps
│   ├── Cloud → Cloud Architecture, Cloud Operations, DevOps
│   ├── Data Science → Data Analytics, Machine Learning, Data Engineering
│   ├── Programming → Front-end Development, Back-end Development, Mobile Development
│   └── Cybersecurity → Security Operations, Penetration Testing, Governance & Risk
├── Business & Operations
│   ├── HR → Talent Acquisition, People Operations, Learning & Development
│   ├── Marketing → Digital Marketing, SEO, Content Strategy, Performance Ads
│   ├── Accounting → Financial Reporting, Tax & Compliance, Bookkeeping
│   ├── Business Strategy → Strategic Planning, Product Management, Business Analysis
│   └── Finance → Corporate Finance, Investment Analysis, Financial Modeling
├── Creative & Service Industries
│   ├── Hotel Management → Hotel Operations, Revenue Management, Front Office
│   ├── Hospitality → Food & Beverage, Guest Relations, Event Service
│   ├── Support Services → Customer Support, Service Operations, Technical Support
│   └── Customer Experience → Journey Design, CX Analytics, Service Design
└── Education & Human Sciences
    ├── Teaching & Pedagogy → Instructional Methods, Classroom Practice, Assessment Design
    └── Instructional Design → Learning Experience Design, E-learning Development,
				Assessment & Evaluation

Each focus stream contains published Courses (leaves). A course detail page carries its
syllabus, price, rating, instructor, estimated duration, and enrollment action.
```

Catalog search spans course titles, departments, categories, focus streams, instructors, and descriptions. Difficulty, maximum price, rating, and the selected focus stream can be combined as filters.

## Layout outlines

### Homepage / catalog

- Sticky masthead: brand, Explore / My learning / Teach / Admin navigation, account, and basket.
- Introductory heading, followed by a keyword search and difficulty, price, and rating controls.
- Upskilling Tree directory: department selector; selected department's category branches; selected branch's focus-stream chips; matching course leaves.
- Each course leaf shows image, level, taxonomy path, instructor, learner count, rating, duration, price, and course-details action.

### Category / branch page

- Tree breadcrumb: root → department → category.
- Category overview and descriptive copy, then selectable focus streams.
- Filtered leaf cards with course metadata; a useful empty state when no published course matches.
- Implemented as a selection state in the catalog rather than a separate URL route in this prototype.

### Course details / leaf page

- Course image, full title, department/category/stream path, description, rating, student count, level, duration, and instructor.
- Syllabus outline and a clear add-to-basket action with the course price.
- Basket summary and checkout handoff; production checkout must create the order on the server and confirm payment using a provider webhook.

### Student dashboard

- Learning, time, and certificate summary metrics.
- Enrolled-course rows with progress, resume action, and certificate affordance.
- Production additions: authenticated course player, lesson resources, quiz scores/attempts, and issued certificate downloads.

## System architecture

```text
Browser UI (tree catalog, course pages, student / instructor / admin workspaces)
	│ HTTPS + authenticated API
	▼
Application API ── Catalog & taxonomy service ── Relational database
	│             Enrollment / progress service
	│             Course authoring / approval service
	├── Payment provider (Stripe / PayPal / Razorpay) + signed webhooks
	├── Object storage + CDN (video, course files, certificates)
	├── Video delivery / streaming provider
	└── Email / notifications

Role-based authorization and audit logging protect instructor, student, and admin actions.
The prototype in index.html supplies only the browser UI and in-memory sample data.
```

Suggested production boundaries: a web client calls a versioned application API; the API enforces role and ownership checks, validates catalog changes, and persists transactional data. Payment status is derived from verified provider webhooks, never from a browser redirect. Video and attachments live in private object storage and use short-lived signed delivery URLs. Keep the payment provider behind a small adapter so Stripe, PayPal, or Razorpay can be selected per deployment.

## Database schema concept

IDs below are primary keys unless marked `FK`; timestamps and soft-delete/audit fields are omitted for readability.

```text
Department(id, name, slug, sort_order, is_active)
Category(id, department_id FK → Department, name, slug, sort_order, is_active)
SubStream(id, category_id FK → Category, name, slug, sort_order, is_active)

User(id, email UNIQUE, display_name, password_hash / identity_provider_id,
     role, status, created_at)
Course(id, sub_stream_id FK → SubStream, instructor_id FK → User,
       title, slug, description, level, duration_minutes, price_minor,
       currency, status, published_at)
CourseSection(id, course_id FK → Course, title, sort_order)
Lesson(id, section_id FK → CourseSection, title, media_asset_id,
       duration_seconds, sort_order, is_preview)
CourseResource(id, course_id FK → Course, lesson_id FK → Lesson NULL,
	       asset_id, title, resource_type)
Quiz(id, lesson_id FK → Lesson, title)
QuizQuestion(id, quiz_id FK → Quiz, prompt, question_type, sort_order)

Order(id, user_id FK → User, status, subtotal_minor, currency,
      payment_provider, provider_payment_id, paid_at)
OrderItem(id, order_id FK → Order, course_id FK → Course,
	  unit_price_minor, currency)
Enrollment(id, user_id FK → User, course_id FK → Course,
	   order_item_id FK → OrderItem, status, enrolled_at, UNIQUE(user_id, course_id))
LessonProgress(id, enrollment_id FK → Enrollment, lesson_id FK → Lesson,
	       completed_at, last_position_seconds)
QuizAttempt(id, enrollment_id FK → Enrollment, quiz_id FK → Quiz,
	    score, submitted_at)
Certificate(id, enrollment_id FK → Enrollment, certificate_number UNIQUE,
	    asset_id, issued_at)
Review(id, enrollment_id FK → Enrollment, rating, body, status, created_at)
InstructorPayout(id, instructor_id FK → User, amount_minor, currency,
		 status, provider_transfer_id, paid_at)
```

Relationships: one Department has many Categories; each Category has many SubStreams; each SubStream has many Courses; each Course belongs to one instructor. Users place Orders containing OrderItems; paid OrderItems create Enrollments. Enrollments track LessonProgress and QuizAttempts and may produce a Certificate and Review. Courses move through draft → submitted → approved/published or returned/rejected; enrollment and payout totals should be derived from ledger-backed order and payout records. Store money as integer minor units plus ISO currency, and snapshot the purchased unit price on `OrderItem` so later course price changes do not rewrite history.

## Responsive tree implementation

The working React conversion is implemented in [`src/App.jsx`](src/App.jsx) and [`src/styles.css`](src/styles.css): the department and branch controls form the trunk and branches, stream chips represent twigs, and course cards are leaf nodes. The layout collapses into a compact stacked explorer on mobile; keyboard-operable native buttons/selects and reduced-motion handling are included. The same taxonomy data drives the category controls and course results, avoiding a second hard-coded navigation tree.
