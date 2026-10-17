import { useMemo, useRef, useState } from 'react';
import { allCourses, departments, quickStats } from './data/treeData';

const currency = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

const navItems = ['Explore', 'Learner', 'Instructor', 'Admin'];

const dailyPurchaseData = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 49 },
  { day: 'Thu', value: 71 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 94 },
  { day: 'Sun', value: 76 },
];

const dashboardTemplates = [
  {
    id: 'learner',
    label: 'Learner',
    title: 'Stay on track',
    subtitle: 'Progress, recommendations, and momentum in one place.',
    accent: 'learner',
    preview: ['My Path', 'Progress', 'Certificates'],
    stats: [
      { label: 'Courses in progress', value: '3', meta: '+1 this month' },
      { label: 'Learning hours', value: '24', meta: 'this month' },
      { label: 'Certificates', value: '2', meta: 'earned' },
    ],
    highlights: [
      { name: 'AI Product Bootcamp', progress: 72, status: 'Continue lesson 5' },
      { name: 'UX Research Sprint', progress: 46, status: 'Resume project' },
      { name: 'Cloud Essentials', progress: 81, status: 'View certificate' },
    ],
  },
  {
    id: 'instructor',
    label: 'Instructor',
    title: 'Teach with clarity',
    subtitle: 'Course health, learner engagement, and publishing status.',
    accent: 'instructor',
    preview: ['Courses', 'Students', 'Ratings'],
    stats: [
      { label: 'Students', value: '1,284', meta: '+12.8%' },
      { label: 'Revenue', value: 'Rs. 8.4k', meta: 'this month' },
      { label: 'Avg rating', value: '4.8', meta: 'from 312 reviews' },
    ],
    highlights: [
      { name: 'Fundamentals of Prompt Design', progress: 64, status: 'Draft ready' },
      { name: 'Data Storytelling Lab', progress: 88, status: 'Published' },
      { name: 'Teaching Playbook', progress: 51, status: 'Needs review' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    title: 'Run the platform',
    subtitle: 'Sales signal, growth insights, and customer feedback in one view.',
    accent: 'admin',
    preview: ['Revenue', 'Demand', 'Feedback'],
    stats: [
      { label: 'Gross revenue', value: 'Rs. 48.6k', meta: '+9.4%' },
      { label: 'Active learners', value: '8,249', meta: 'this month' },
      { label: 'Pending approvals', value: '3', meta: 'need review' },
    ],
    highlights: [
      { name: 'AI demand up', progress: 82, status: 'Strong conversion' },
      { name: 'Course quality score', progress: 91, status: 'Above target' },
      { name: 'Support backlog', progress: 33, status: 'Needs review' },
    ],
  },
];

function App() {
  const catalogRef = useRef(null);
  const [activeDepartmentId, setActiveDepartmentId] = useState('technical');
  const [activeCategory, setActiveCategory] = useState('AI');
  const [activeStream, setActiveStream] = useState('Generative AI');
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('ai-gen');
  const [selectedDashboard, setSelectedDashboard] = useState('admin');
  const [activeNav, setActiveNav] = useState('Explore');
  const [basket, setBasket] = useState(['ai-gen', 'cloud-devops']);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const activeDepartment = departments.find((department) => department.id === activeDepartmentId) ?? departments[0];
  const activeCategoryData = activeDepartment.categories.find((category) => category.name === activeCategory) ?? activeDepartment.categories[0];

  const departmentCourses = useMemo(
    () => allCourses.filter((course) => course.department === activeDepartment.id),
    [activeDepartment]
  );

  const visibleCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departmentCourses.filter((course) => {
      const matchesDepartment = course.department === activeDepartment.id;
      const matchesCategory = !activeCategory || course.category === activeCategory;
      const matchesStream = !activeStream || course.stream === activeStream;
      const matchesQuery =
        !query ||
        [course.title, course.category, course.stream, course.instructor, course.blurb]
          .join(' ')
          .toLowerCase()
          .includes(query);

      return matchesDepartment && matchesCategory && matchesStream && matchesQuery;
    });
  }, [activeCategory, activeDepartment, activeStream, departmentCourses, search]);

  const selectedCourse = allCourses.find((course) => course.id === selectedCourseId) ?? visibleCourses[0] ?? departmentCourses[0];
  const activeDashboard = dashboardTemplates.find((template) => template.id === selectedDashboard) ?? dashboardTemplates[0];

  const basketCourses = useMemo(
    () => basket.map((courseId) => allCourses.find((course) => course.id === courseId)).filter(Boolean),
    [basket]
  );

  const basketTotal = useMemo(
    () => basketCourses.reduce((total, course) => total + course.price, 0),
    [basketCourses]
  );

  const departmentHighlights = [
    { label: 'Career paths', value: activeDepartment.categories.length + ' focus areas' },
    { label: 'Course count', value: `${departmentCourses.length}+ courses` },
    { label: 'Average rating', value: '4.8/5' },
    { label: 'Delivery style', value: 'Live + project based' },
  ];

  const handleAddToBasket = (course = selectedCourse) => {
    if (!course || basket.includes(course.id)) return;
    setBasket((current) => [...current, course.id]);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    setFeedbackSubmitted(true);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">N</div>
          <div>
            <p className="eyebrow">Learn. Grow. Thrive.</p>
            <h1>Nourskill</h1>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`nav-link ${activeNav === item ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(item);
                if (item === 'Explore') scrollToCatalog();
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <button type="button" className="secondary-btn">Log in</button>
          <button type="button" className="primary-btn">Start learning</button>
          <div className="basket-pill" aria-label={`Cart with ${basket.length} items`}>
            Cart ({basket.length})
          </div>
        </div>
      </header>

      <main className="container">
        <section className="dashboard-selector-box">
          <div className="selector-header">
            <div>
              <p className="eyebrow accent">Template chooser</p>
              <h3>Pick a dashboard type</h3>
            </div>
          </div>

          <div className="template-switcher">
            {dashboardTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`template-card ${selectedDashboard === template.id ? 'selected' : ''} ${template.accent}`}
                onClick={() => setSelectedDashboard(template.id)}
              >
                <div className="template-top-row">
                  <span className="template-label">{template.label}</span>
                  {selectedDashboard === template.id && <span className="template-badge">Selected</span>}
                </div>

                <div className="template-preview" aria-hidden="true">
                  <div className="mini-window">
                    <div className="mini-header">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="mini-metrics">
                      <div className="mini-metric" />
                      <div className="mini-metric short" />
                    </div>
                    <div className="mini-bars">
                      <span style={{ height: '54%' }} />
                      <span style={{ height: '72%' }} />
                      <span style={{ height: '46%' }} />
                      <span style={{ height: '88%' }} />
                    </div>
                  </div>
                </div>

                <strong>{template.title}</strong>
                <small>{template.subtitle}</small>
              </button>
            ))}
          </div>

          <div className={`dashboard-panel ${selectedDashboard}`}>
            <div className="dashboard-summary">
              <div>
                <p className="eyebrow accent">Current template</p>
                <h3>{activeDashboard.title}</h3>
              </div>
              <span className="status-pill">{activeDashboard.label}</span>
            </div>

            <div className="metric-grid">
              {activeDashboard.stats.map((stat) => (
                <div key={stat.label} className="metric-box">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <small>{stat.meta}</small>
                </div>
              ))}
            </div>

            {selectedDashboard === 'learner' && (
              <div className="role-layout learner-layout">
                <div className="focus-panel large">
                  <div className="panel-head">
                    <p className="eyebrow accent">My path</p>
                    <h4>Current learning focus</h4>
                  </div>
                  <div className="path-card">
                    <div>
                      <small>Next lesson</small>
                      <strong>AI Product Bootcamp</strong>
                    </div>
                    <button type="button" className="secondary-btn small">Resume</button>
                  </div>
                  <div className="progress-ring">
                    <span>72%</span>
                  </div>
                </div>

                <div className="focus-panel">
                  <div className="panel-head">
                    <p className="eyebrow accent">Streak</p>
                    <h4>7-day momentum</h4>
                  </div>
                  <div className="streak-row">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                      <span key={day} className={index < 5 ? 'active-day' : ''}>{day}</span>
                    ))}
                  </div>
                  <p className="mini-note">You are 2 lessons away from your weekly goal.</p>
                </div>
              </div>
            )}

            {selectedDashboard === 'instructor' && (
              <div className="role-layout instructor-layout">
                <div className="focus-panel large">
                  <div className="panel-head">
                    <p className="eyebrow accent">Course performance</p>
                    <h4>Student engagement</h4>
                  </div>
                  <div className="engagement-bars">
                    <div><span>Prompt Design</span><b>82%</b></div>
                    <div><span>Storytelling Lab</span><b>76%</b></div>
                    <div><span>Teaching Playbook</span><b>63%</b></div>
                  </div>
                </div>

                <div className="focus-panel">
                  <div className="panel-head">
                    <p className="eyebrow accent">Schedule</p>
                    <h4>Next live session</h4>
                  </div>
                  <div className="session-card">
                    <strong>Thursday, 6:30 PM</strong>
                    <small>Live workshop: AI prompt patterns</small>
                  </div>
                </div>
              </div>
            )}

            {selectedDashboard === 'admin' && (
              <div className="role-layout admin-layout">
                <div className="focus-panel large">
                  <div className="panel-head">
                    <p className="eyebrow accent">Platform pulse</p>
                    <h4>Growth overview</h4>
                  </div>
                  <div className="engagement-bars">
                    <div><span>Lead conversion</span><b>31%</b></div>
                    <div><span>Course adoption</span><b>74%</b></div>
                    <div><span>Retention</span><b>68%</b></div>
                  </div>
                </div>

                <div className="focus-panel">
                  <div className="panel-head">
                    <p className="eyebrow accent">Review</p>
                    <h4>Top concern</h4>
                  </div>
                  <p className="mini-note">Support backlog is down 9% after the latest routing fix.</p>
                </div>
              </div>
            )}

            <div className="template-content-grid">
              {activeDashboard.highlights.map((item) => (
                <div key={item.name} className="content-card">
                  <div className="content-row">
                    <strong>{item.name}</strong>
                    <span>{item.status}</span>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: `${item.progress}%` }} />
                  </div>
                  <small>{item.progress}% complete</small>
                </div>
              ))}
            </div>

            {selectedDashboard === 'admin' && (
              <div className="admin-insights-grid">
                <div className="analytics-panel">
                  <div className="analytics-header">
                    <div>
                      <p className="eyebrow accent">Everyday buying chart</p>
                      <h4>Purchase activity overview</h4>
                    </div>
                    <span className="trend-chip">+18.4% vs last week</span>
                  </div>

                  <div className="buying-chart" aria-label="Daily purchase chart">
                    {dailyPurchaseData.map((item) => (
                      <div key={item.day} className="purchase-column">
                        <div className="bar-track">
                          <div className="bar-fill" style={{ height: `${item.value}%` }} />
                        </div>
                        <span>{item.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="chart-summary">
                    <div>
                      <small>Total buys</small>
                      <strong>2,048</strong>
                    </div>
                    <div>
                      <small>Average daily</small>
                      <strong>293</strong>
                    </div>
                    <div>
                      <small>Top day</small>
                      <strong>Saturday</strong>
                    </div>
                  </div>
                </div>

                <form className="feedback-panel">
                  <div className="feedback-header">
                    <p className="eyebrow accent">Customer feedback</p>
                    <h4>Share your experience</h4>
                  </div>

                  <label className="field-group">
                    <span>Name</span>
                    <input type="text" placeholder="Your name" />
                  </label>

                  <label className="field-group">
                    <span>Email</span>
                    <input type="email" placeholder="you@example.com" />
                  </label>

                  <label className="field-group">
                    <span>Feedback</span>
                    <textarea rows="4" placeholder="Tell us what you liked or what could improve..." />
                  </label>

                  <button type="submit" className="primary-btn">Submit feedback</button>
                </form>
              </div>
            )}
          </div>
        </section>

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow accent">Made for India's next generation of talent</p>
            <h2>Build skills for the work and life you want.</h2>
            <p>
              Explore practical learning paths, expert-led courses, and real-world projects designed to help your career move forward.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-btn" onClick={scrollToCatalog}>Browse catalog</button>
              <button type="button" className="secondary-btn" onClick={() => setSelectedDashboard('learner')}>View roadmap</button>
            </div>

            <div className="stat-grid">
              {Object.entries(quickStats).map(([key, value]) => (
                <div key={key} className="stat-card">
                  <span>{value}</span>
                  <small>{key}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="tree-card">
              <div className="tree-title-row">
                <span>Upskilling Tree</span>
                <span className="badge">Live</span>
              </div>

              <div className="tree-branch">
                <div className="node root">Foundation</div>
                <div className="branch-line" />
              </div>

              <div className="tree-levels">
                {departments.map((department) => (
                  <button
                    key={department.id}
                    className={`tree-node ${department.id === activeDepartmentId ? 'selected' : ''}`}
                    onClick={() => {
                      setActiveDepartmentId(department.id);
                      const nextCategory = department.categories[0]?.name ?? 'AI';
                      const nextStream = department.categories[0]?.streams[0]?.name ?? 'Generative AI';
                      setActiveCategory(nextCategory);
                      setActiveStream(nextStream);
                    }}
                  >
                    {department.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="portal-layout" ref={catalogRef}>
          <aside className="sidebar-panel">
            <div className="panel-header">
              <h3>{activeDepartment.name}</h3>
              <p>{activeDepartment.intro}</p>
            </div>

            <div className="category-list">
              {activeDepartment.categories.map((category) => (
                <button
                  key={category.name}
                  className={`category-pill ${activeCategory === category.name ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveCategory(category.name);
                    setActiveStream(category.streams[0]?.name ?? '');
                  }}
                >
                  <span>{category.name}</span>
                  <small>{category.streams.length} streams</small>
                </button>
              ))}
            </div>

            <div className="stream-list">
              <h4>Focus streams</h4>
              {activeCategoryData.streams.map((stream) => (
                <button
                  key={stream.name}
                  className={`stream-pill ${activeStream === stream.name ? 'selected' : ''}`}
                  onClick={() => setActiveStream(stream.name)}
                >
                  {stream.name}
                </button>
              ))}
            </div>
          </aside>

          <section className="content-panel">
            <div className="landing-header">
              <div>
                <p className="eyebrow accent">Department landing page</p>
                <h3>{activeDepartment.name}</h3>
              </div>
              <div className="search-wrap">
                <input
                  type="search"
                  placeholder="Search courses, instructors, skills..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="department-highlights">
              {departmentHighlights.map((item) => (
                <div key={item.label} className="highlight-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>

            <div className="category-spotlight">
              <div>
                <p className="eyebrow accent">Featured category</p>
                <h4>{activeCategoryData.name}</h4>
              </div>
              <p>{activeCategoryData.description}</p>
            </div>

            <div className="course-grid-header">
              <h4>
                {activeStream} • {visibleCourses.length} courses
              </h4>
              <button type="button" className="secondary-btn small" onClick={() => setSelectedDashboard('instructor')}>View full curriculum</button>
            </div>

            <div className="course-grid">
              {visibleCourses.map((course) => (
                <article key={course.id} className="course-card" onClick={() => setSelectedCourseId(course.id)}>
                  <img src={course.image} alt={course.title} />
                  <div className="course-body">
                    <div className="meta-row">
                      <span>{course.category}</span>
                      <span>{course.level}</span>
                    </div>
                    <h5>{course.title}</h5>
                    <p>{course.blurb}</p>
                    <div className="instructor-row">
                      <strong>{course.instructor}</strong>
                      <span>{course.rating} ★</span>
                    </div>
                    <div className="price-row">
                      <strong>{currency(course.price)}</strong>
                      <span>{currency(course.oldPrice)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="detail-strip">
          <div className="detail-panel">
            <div>
              <p className="eyebrow accent">Current course focus</p>
              <h4>{selectedCourse.title}</h4>
            </div>
            <div className="detail-meta">
              <span>{selectedCourse.stream}</span>
              <span>{selectedCourse.hours} hours</span>
              <span>{selectedCourse.students.toLocaleString()} learners</span>
            </div>
            <div className="detail-actions">
              <button type="button" className="primary-btn" onClick={() => handleAddToBasket(selectedCourse)}>
                {basket.includes(selectedCourse.id) ? 'Added to cart' : `Add to cart · ${currency(selectedCourse.price)}`}
              </button>
              <span className="basket-summary">{basket.length} in cart</span>
            </div>
          </div>

          <div className="detail-content">
            <div className="detail-basket">
              <div>
                <p className="eyebrow accent">Cart summary</p>
                <h4>{basketCourses.length} course{basketCourses.length === 1 ? '' : 's'}</h4>
              </div>
              <strong>{currency(basketTotal)}</strong>
            </div>
            <ul>
              {selectedCourse.syllabus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-panel">
            <div className="analytics-header">
              <div>
                <p className="eyebrow accent">Everyday buying chart</p>
                <h3>Purchase activity overview</h3>
              </div>
              <span className="trend-chip">+18.4% vs last week</span>
            </div>

            <div className="buying-chart" aria-label="Daily purchase chart">
              {dailyPurchaseData.map((item) => (
                <div key={item.day} className="purchase-column">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${item.value}%` }} />
                  </div>
                  <span>{item.day}</span>
                </div>
              ))}
            </div>

            <div className="chart-summary">
              <div>
                <small>Total buys</small>
                <strong>2,048</strong>
              </div>
              <div>
                <small>Average daily</small>
                <strong>293</strong>
              </div>
              <div>
                <small>Top day</small>
                <strong>Saturday</strong>
              </div>
            </div>
          </div>

          <form className="feedback-panel" onSubmit={handleFeedbackSubmit}>
            <div className="feedback-header">
              <p className="eyebrow accent">Customer feedback</p>
              <h3>Share your experience</h3>
            </div>

            <label className="field-group">
              <span>Name</span>
              <input type="text" placeholder="Your name" defaultValue="" />
            </label>

            <label className="field-group">
              <span>Email</span>
              <input type="email" placeholder="you@example.com" defaultValue="" />
            </label>

            <label className="field-group">
              <span>Feedback</span>
              <textarea rows="4" placeholder="Tell us what you liked or what could improve..." defaultValue="" />
            </label>

            {feedbackSubmitted && (
              <div className="success-banner" role="status">Thanks! Your feedback has been recorded.</div>
            )}

            <button type="submit" className="primary-btn">Submit feedback</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
