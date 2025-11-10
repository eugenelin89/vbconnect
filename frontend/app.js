const { useCallback, useEffect, useMemo, useState } = React;

const storageKeys = {
  apiBase: "vbconnect:apiBase",
  token: "vbconnect:token",
  user: "vbconnect:user",
};

const ROLE_CAPABILITIES = {
  player: [
    "Update personal profile & training logs",
    "Submit metrics for coach verification",
    "View team dashboards & achievements",
  ],
  coach: [
    "Create teams & invite/approve players",
    "Verify metrics and training logs",
    "Award achievements & grant tokens",
  ],
  coordinator: [
    "Approve teams & coaches",
    "Review all division activity",
    "Oversee token economy",
  ],
  parent: [
    "Join player's team for oversight",
    "Verify training activity",
    "View achievement history",
  ],
  admin: [
    "Full system oversight",
    "Manage roles & permissions",
    "Adjust tokens and achievements",
  ],
};

const METRIC_LABELS = {
  fastball_velocity: "Fastball Velocity",
  exit_velocity: "Exit Velocity",
  pop_time: "Pop Time",
  sixty_yard_dash: "60 Yard Dash",
};

const METRIC_OPTIONS = Object.entries(METRIC_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TRAINING_OPTIONS = [
  "throwing",
  "hitting",
  "running",
  "strength",
  "mobility",
];

function clsx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useBooleanMap() {
  const [state, setState] = useState({});

  const setTrue = useCallback((key) => {
    setState((prev) => ({ ...prev, [key]: true }));
  }, []);

  const setFalse = useCallback((key) => {
    setState((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const isActive = useCallback((key) => Boolean(state[key]), [state]);

  return { isActive, setTrue, setFalse };
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timeout);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div id="notification" role="status" aria-live="assertive">
      <div className={clsx("toast", toast.tone)}>
        <span>{toast.message}</span>
        <button type="button" aria-label="Dismiss" onClick={onDismiss}>
          &times;
        </button>
      </div>
    </div>
  );
}

function Header({ apiBase, onApiBaseCommit, authed, onLogout }) {
  const [draft, setDraft] = useState(apiBase);

  useEffect(() => {
    setDraft(apiBase);
  }, [apiBase]);

  const handleBlur = useCallback(() => {
    onApiBaseCommit(draft);
  }, [draft, onApiBaseCommit]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onApiBaseCommit(draft);
      }
    },
    [draft, onApiBaseCommit]
  );

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Vancouver Baseball Connect</p>
        <h1>Role-aware performance console</h1>
        <p className="lede">
          Coordinate players, coaches, coordinators, and parents through one responsive hub.
        </p>
      </div>
      <div className="header-actions">
        <label className="input-chip">
          API Base
          <input
            type="text"
            placeholder="https://example.com"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        </label>
        <button
          type="button"
          className="ghost-button"
          onClick={onLogout}
          style={{ visibility: authed ? "visible" : "hidden" }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

function Sidebar({ authed, user, profile, capabilities, lastSynced }) {
  const initials = useMemo(() => {
    if (!user) return "";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "";
  }, [user]);

  const statusLabel = useMemo(() => {
    if (!authed) return "—";
    if (!profile) return "Syncing…";
    return profile.public_profile ? "Public" : "Private";
  }, [authed, profile]);

  const lastSyncedLabel = useMemo(() => {
    if (!authed) return "—";
    if (!lastSynced) return "Syncing…";
    return lastSynced.toLocaleTimeString();
  }, [authed, lastSynced]);

  return (
    <aside className="sidebar" aria-label="Quick stats">
      <section className="card compact profile-card">
        <div className="profile-card-header">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile avatar"
              className="profile-avatar"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="profile-avatar fallback" aria-hidden="true">
              {initials || ""}
            </div>
          )}
          <div>
            <h2>{authed ? `${user?.first_name || "Player"} ${user?.last_name || ""}`.trim() : "Profile Snapshot"}</h2>
            <p className="muted">{authed ? user?.email : "Sign in to load details."}</p>
            {authed && user?.role ? <span className="badge">{user.role}</span> : null}
          </div>
        </div>
        {authed ? (
          <p className="muted">
            {user?.bio || "Add a short bio so coaches understand your goals."}
          </p>
        ) : null}
        <dl className="profile-meta">
          <div>
            <dt>Status</dt>
            <dd>{statusLabel}</dd>
          </div>
          <div>
            <dt>Last synced</dt>
            <dd>{lastSyncedLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="card compact">
        <h2>Role Access</h2>
        {authed ? (
          <ul className="stack-list">
            <li>
              <strong>Current role:</strong> {user?.role?.toUpperCase()}
            </li>
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Sign in to view capabilities tailored to your role.</p>
        )}
      </section>

      <section className="card compact">
        <h2>Quick Checks</h2>
        <ul className="stack-list">
          <li>✔️ Schema current (migrations applied)</li>
          <li>✔️ API docs live at <code>/api/docs</code></li>
          <li>✔️ Tests: <code>pytest</code></li>
        </ul>
      </section>
    </aside>
  );
}

function AuthPanel({ onRegister, onLogin, loadingRegister, loadingLogin }) {
  const handleRegister = useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      const success = await onRegister(payload);
      if (success) {
        form.reset();
      }
    },
    [onRegister]
  );

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      const success = await onLogin(payload);
      if (success) {
        form.reset();
      }
    },
    [onLogin]
  );

  return (
    <section className="panel">
      <header>
        <h2>Authentication</h2>
        <p>Register or sign in to unlock role-specific experiences.</p>
      </header>
      <div className="panel-grid">
        <form onSubmit={handleRegister}>
          <h3>Create account</h3>
          <div className="field-row">
            <label>
              First name
              <input name="first_name" required />
            </label>
            <label>
              Last name
              <input name="last_name" required />
            </label>
          </div>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <label>
            Role
            <select name="role" required defaultValue="player">
              <option value="player">Player</option>
              <option value="coach">Coach</option>
              <option value="coordinator">Coordinator</option>
              <option value="parent">Parent</option>
            </select>
          </label>
          <label>
            Bio
            <textarea name="bio" rows="2" placeholder="Optional"></textarea>
          </label>
          <button className="primary-button" disabled={loadingRegister}>
            {loadingRegister ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <form onSubmit={handleLogin}>
          <h3>Sign in</h3>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button className="primary-button" disabled={loadingLogin}>
            {loadingLogin ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}

function ProfilePanel({ profile, onSubmit, loading }) {
  const initialForm = useMemo(
    () => ({
      position: profile?.position || "",
      bats: profile?.bats || "",
      throws: profile?.throws || "",
      height_cm: profile?.height_cm ? String(profile.height_cm) : "",
      weight_kg: profile?.weight_kg ? String(profile.weight_kg) : "",
      graduation_year: profile?.graduation_year ? String(profile.graduation_year) : "",
      school: profile?.school || "",
      avatar_url: profile?.avatar_url || "",
      public_profile: Boolean(profile?.public_profile),
    }),
    [profile]
  );

  const [formState, setFormState] = useState(initialForm);

  useEffect(() => {
    setFormState(initialForm);
  }, [initialForm]);

  const handleChange = useCallback((event) => {
    const { name, type, value, checked } = event.target;
    setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      await onSubmit(formState);
    },
    [formState, onSubmit]
  );

  return (
    <section className="panel">
      <header>
        <h2>My Player Profile</h2>
        <p>Update roster-ready details shown on dashboards.</p>
      </header>
      <form className="panel-grid" onSubmit={handleSubmit}>
        <label>
          Position
          <input name="position" value={formState.position} onChange={handleChange} />
        </label>
        <div className="field-row">
          <label>
            Bats
            <select name="bats" value={formState.bats} onChange={handleChange}>
              <option value="">-</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
              <option value="S">Switch</option>
            </select>
          </label>
          <label>
            Throws
            <select name="throws" value={formState.throws} onChange={handleChange}>
              <option value="">-</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
            </select>
          </label>
        </div>
        <div className="field-row">
          <label>
            Height (cm)
            <input
              type="number"
              name="height_cm"
              min="0"
              value={formState.height_cm}
              onChange={handleChange}
            />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              name="weight_kg"
              min="0"
              value={formState.weight_kg}
              onChange={handleChange}
            />
          </label>
        </div>
        <label>
          Graduation year
          <input
            type="number"
            name="graduation_year"
            min="2024"
            value={formState.graduation_year}
            onChange={handleChange}
          />
        </label>
        <label>
          School
          <input name="school" value={formState.school} onChange={handleChange} />
        </label>
        <label>
          Avatar URL
          <input
            name="avatar_url"
            type="url"
            placeholder="https://"
            value={formState.avatar_url}
            onChange={handleChange}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="public_profile"
            checked={formState.public_profile}
            onChange={handleChange}
          />
          Public profile visible to coaches
        </label>
        <button className="primary-button" disabled={loading}>
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </section>
  );
}

function TeamsPanel({
  divisions,
  teams,
  canCreateTeam,
  canJoinTeam,
  canApproveCoach,
  onCreateTeam,
  onJoinTeam,
  onApproveCoach,
  loadingCreate,
  loadingJoin,
  loadingApprove,
}) {
  const createDivisionOptions = useMemo(
    () => divisions,
    [divisions]
  );
  const hasDivisions = createDivisionOptions.length > 0;

  const handleSubmit = useCallback(async (event, handler) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const success = await handler(payload);
    if (success) {
      form.reset();
    }
  }, []);

  return (
    <section className="panel">
      <header>
        <h2>Teams &amp; Divisions</h2>
        <p>Coordinate rosters, approvals, and seasonal alignment.</p>
      </header>
      <div className="panel-grid">
        {canCreateTeam ? (
          <form onSubmit={(event) => handleSubmit(event, onCreateTeam)}>
            <h3>Create team</h3>
            <label>
              Team name
              <input name="name" required />
            </label>
            <label>
              Season year
              <input name="season_year" type="number" min="2024" required />
            </label>
            <label>
              Division
              <select
                name="division"
                required
                defaultValue=""
                disabled={!hasDivisions}
              >
                <option value="" disabled>
                  {hasDivisions ? "Select a division" : "No divisions available"}
                </option>
                {createDivisionOptions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </label>
            {!hasDivisions ? (
              <p className="muted">
                Add a division in the admin console to enable team creation.
              </p>
            ) : null}
            <button className="primary-button" disabled={loadingCreate || !hasDivisions}>
              {loadingCreate ? "Creating…" : "Create team"}
            </button>
          </form>
        ) : null}

        {canJoinTeam ? (
          <form onSubmit={(event) => handleSubmit(event, onJoinTeam)}>
            <h3>Request to join</h3>
            <label>
              Team ID
              <input name="team_id" required />
            </label>
            <button className="primary-button" disabled={loadingJoin}>
              {loadingJoin ? "Submitting…" : "Send request"}
            </button>
          </form>
        ) : null}

        {canApproveCoach ? (
          <form onSubmit={(event) => handleSubmit(event, onApproveCoach)}>
            <h3>Approve coach</h3>
            <label>
              Team ID
              <input name="team_id" required />
            </label>
            <label>
              Coach ID
              <input name="coach_id" required />
            </label>
            <button className="primary-button" disabled={loadingApprove}>
              {loadingApprove ? "Approving…" : "Approve"}
            </button>
          </form>
        ) : null}
      </div>
      <div className="data-grid">
        <div>
          <h3>Divisions</h3>
          <ul className="stack-list">
            {divisions.map((division) => (
              <li key={division.id}>
                <strong>{division.name}</strong>
                <br />
                <span className="muted">{division.league_type}</span>
              </li>
            ))}
            {!divisions.length ? <li className="muted">No divisions available.</li> : null}
          </ul>
        </div>
        <div>
          <h3>Teams</h3>
          <ul className="stack-list">
            {teams.map((team) => (
              <li key={team.id}>
                <strong>{team.name}</strong> • {team.season_year}
                <br />
                <span className="muted">{team.division_detail?.name || "Division"}</span>
                <br />
                <span className="badge">{team.roster_count} players</span>
              </li>
            ))}
            {!teams.length ? <li className="muted">No teams yet.</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MetricsPanel({
  metrics,
  onSubmit,
  onVerify,
  canVerify,
  loadingSubmit,
  loadingVerify,
}) {
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      const success = await onSubmit(payload);
      if (success) {
        form.reset();
      }
    },
    [onSubmit]
  );

  return (
    <section className="panel">
      <header>
        <h2>Performance Metrics</h2>
        <p>Track velocity, pop time, and other verified stats.</p>
      </header>
      <div className="panel-grid">
        <form onSubmit={handleSubmit}>
          <h3>Add / update metric</h3>
          <label>
            Type
            <select name="metric_type" defaultValue="fastball_velocity">
              {METRIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Value
            <input type="number" name="value" step="0.01" required />
          </label>
          <label>
            Unit
            <input name="unit" placeholder="mph, sec, etc." />
          </label>
          <button className="primary-button" disabled={loadingSubmit}>
            {loadingSubmit ? "Saving…" : "Save metric"}
          </button>
        </form>
        <div>
          <h3>My metrics</h3>
          <ul className="stack-list">
            {metrics.map((metric) => {
              const label = METRIC_LABELS[metric.metric_type] || metric.metric_type;
              const isVerified = metric.is_verified;
              const verifyKey = `verifyMetric-${metric.id}`;
              return (
                <li key={metric.id}>
                  <strong>
                    {label}
                  </strong>{" "}
                  — {metric.value} {metric.unit || ""}
                  <br />
                  <span className="muted">
                    Updated {new Date(metric.created_at).toLocaleDateString()}
                  </span>
                  <br />
                  {isVerified ? (
                    <span className="badge success">Verified</span>
                  ) : (
                    <span className="badge">Pending</span>
                  )}
                  {canVerify && !isVerified ? (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => onVerify(metric.id)}
                      disabled={loadingVerify(verifyKey)}
                    >
                      {loadingVerify(verifyKey) ? "Verifying…" : "Verify"}
                    </button>
                  ) : null}
                </li>
              );
            })}
            {!metrics.length ? <li className="muted">No metrics logged yet.</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TrainingPanel({ logs, onSubmit, onVerify, canVerify, loadingSubmit, loadingVerify }) {
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());
      const success = await onSubmit(payload);
      if (success) {
        form.reset();
      }
    },
    [onSubmit]
  );

  return (
    <section className="panel">
      <header>
        <h2>Training Log</h2>
        <p>Document workouts and request verifications.</p>
      </header>
      <div className="panel-grid">
        <form onSubmit={handleSubmit}>
          <h3>Log session</h3>
          <label>
            Activity
            <select name="activity_type" defaultValue="throwing">
              {TRAINING_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <div className="field-row">
            <label>
              Duration (min)
              <input type="number" name="duration_minutes" required />
            </label>
            <label>
              Date
              <input type="date" name="date" required />
            </label>
          </div>
          <label>
            Notes
            <textarea name="notes" rows="2"></textarea>
          </label>
          <button className="primary-button" disabled={loadingSubmit}>
            {loadingSubmit ? "Saving…" : "Save log"}
          </button>
        </form>
        <div>
          <h3>Recent sessions</h3>
          <ul className="stack-list">
            {logs.map((log) => {
              const verifyKey = `verifyLog-${log.id}`;
              return (
                <li key={log.id}>
                  <strong>{log.activity_type}</strong> • {log.duration_minutes} min on {log.date}
                  <br />
                  <span className="muted">{log.notes || "No notes"}</span>
                  <br />
                  {log.is_verified ? (
                    <span className="badge success">Verified</span>
                  ) : (
                    <span className="badge">Pending</span>
                  )}
                  {canVerify && !log.is_verified ? (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => onVerify(log.id)}
                      disabled={loadingVerify(verifyKey)}
                    >
                      {loadingVerify(verifyKey) ? "Verifying…" : "Verify"}
                    </button>
                  ) : null}
                </li>
              );
            })}
            {!logs.length ? <li className="muted">No training sessions yet.</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AchievementsPanel({
  achievements,
  tokenSummary,
  canManage,
  onAward,
  onGrant,
  loadingAward,
  loadingGrant,
}) {
  const handleSubmit = useCallback(async (event, handler) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const success = await handler(payload);
    if (success) {
      form.reset();
    }
  }, []);

  return (
    <section className="panel">
      <header>
        <h2>Achievements &amp; Tokens</h2>
        <p>Celebrate milestones and stay on top of wallets.</p>
      </header>
      <div className="panel-grid">
        <div>
          <h3>My achievements</h3>
          <ul className="stack-list">
            {achievements.map((item) => (
              <li key={item.id}>
                <strong>{item.achievement?.name}</strong> (tokens: {item.achievement?.token_reward})
                <br />
                <span className="muted">
                  Awarded {new Date(item.awarded_at).toLocaleDateString()}
                </span>
                <br />
                {item.notes || ""}
              </li>
            ))}
            {!achievements.length ? <li className="muted">No achievements yet.</li> : null}
          </ul>
        </div>
        <div>
          <h3>Token wallet</h3>
          <div className="token-balance">
            Balance: {typeof tokenSummary.balance === "number" ? tokenSummary.balance : "—"}
          </div>
          <ul className="stack-list">
            {(tokenSummary.transactions || []).map((tx) => (
              <li key={tx.id || tx.created_at}>
                <strong>
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount} tokens
                </strong>
                <br />
                <span className="muted">{tx.reason}</span>
                <br />
                <span className="muted">{new Date(tx.created_at).toLocaleString()}</span>
              </li>
            ))}
            {!tokenSummary.transactions?.length ? <li className="muted">No token history yet.</li> : null}
          </ul>
        </div>
      </div>
      {canManage ? (
        <div className="panel-grid">
          <form onSubmit={(event) => handleSubmit(event, onAward)}>
            <h3>Award achievement</h3>
            <label>
              Profile ID
              <input name="profile_id" required />
            </label>
            <label>
              Achievement ID
              <input name="achievement_id" required />
            </label>
            <label>
              Notes
              <textarea name="notes" rows="2"></textarea>
            </label>
            <button className="primary-button" disabled={loadingAward}>
              {loadingAward ? "Awarding…" : "Award"}
            </button>
          </form>
          <form onSubmit={(event) => handleSubmit(event, onGrant)}>
            <h3>Grant tokens</h3>
            <label>
              Profile ID
              <input name="profile" required />
            </label>
            <label>
              Amount
              <input type="number" name="amount" required />
            </label>
            <label>
              Reason
              <textarea name="reason" rows="2" required></textarea>
            </label>
            <button className="primary-button" disabled={loadingGrant}>
              {loadingGrant ? "Granting…" : "Grant"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <p>
        Built for the Vancouver Baseball Connect MVP — Django backend at <code>/api/</code>, frontend served as
        static assets. Contributions welcome via AGENTS guidelines.
      </p>
    </footer>
  );
}

function App() {
  const [apiBase, setApiBase] = useState(() => {
    const stored = localStorage.getItem(storageKeys.apiBase);
    return stored || "http://localhost:8000";
  });
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(storageKeys.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Failed to parse stored user", error);
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tokenSummary, setTokenSummary] = useState({ balance: 0, transactions: [] });
  const [toast, setToast] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  const { isActive: isLoading, setTrue: startLoading, setFalse: stopLoading } = useBooleanMap();

  const authed = Boolean(token && user);

  useEffect(() => {
    if (apiBase) {
      localStorage.setItem(storageKeys.apiBase, apiBase);
    } else {
      localStorage.removeItem(storageKeys.apiBase);
    }
  }, [apiBase]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(storageKeys.token, token);
    } else {
      localStorage.removeItem(storageKeys.token);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageKeys.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(storageKeys.user);
    }
  }, [user]);

  const pushToast = useCallback((message, tone = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  const commitApiBase = useCallback(
    (value) => {
      const cleaned = value.trim().replace(/\/$/, "");
      setApiBase((prev) => {
        if (prev === cleaned) {
          return prev;
        }
        if (cleaned) {
          pushToast(`API base set to ${cleaned}`);
        } else {
          pushToast("API base cleared", "error");
        }
        return cleaned;
      });
    },
    [pushToast]
  );

  const apiRequest = useCallback(
    async (path, { method = "GET", body, headers = {} } = {}) => {
      const base = apiBase?.trim().replace(/\/$/, "");
      if (!base) {
        throw new Error("API base URL not configured.");
      }
      const options = { method, headers: { ...headers } };
      if (token) {
        options.headers.Authorization = `Token ${token}`;
      }
      if (body instanceof FormData) {
        options.body = body;
      } else if (body !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
      const response = await fetch(`${base}${path}`, options).catch((error) => {
        throw new Error(`Network error: ${error.message}`);
      });
      if (!response.ok) {
        let detail = "";
        try {
          const data = await response.json();
          detail = data.detail || JSON.stringify(data);
        } catch (error) {
          detail = await response.text();
        }
        throw new Error(detail || `Request failed (${response.status})`);
      }
      if (response.status === 204) return null;
      return response.json();
    },
    [apiBase, token]
  );

  const withLoader = useCallback(
    async (key, task) => {
      startLoading(key);
      try {
        return await task();
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

  const fetchCurrentUser = useCallback(async () => {
    const data = await apiRequest("/api/auth/me/");
    setUser(data);
    return data;
  }, [apiRequest]);

  const fetchProfile = useCallback(async () => {
    const data = await apiRequest("/api/profile/");
    setProfile(data);
    return data;
  }, [apiRequest]);

  const fetchDivisions = useCallback(async () => {
    const data = await apiRequest("/api/divisions/");
    setDivisions(data);
    return data;
  }, [apiRequest]);

  const fetchTeams = useCallback(async () => {
    const data = await apiRequest("/api/teams/");
    setTeams(data);
    return data;
  }, [apiRequest]);

  const fetchMetrics = useCallback(async () => {
    const data = await apiRequest("/api/metrics/");
    setMetrics(data);
    return data;
  }, [apiRequest]);

  const fetchLogs = useCallback(async () => {
    const data = await apiRequest("/api/training/");
    setLogs(data);
    return data;
  }, [apiRequest]);

  const fetchAchievements = useCallback(async () => {
    const data = await apiRequest("/api/achievements/");
    setAchievements(data);
    return data;
  }, [apiRequest]);

  const fetchTokens = useCallback(async () => {
    const data = await apiRequest("/api/tokens/");
    setTokenSummary(data);
    return data;
  }, [apiRequest]);

  const hydrate = useCallback(async () => {
    if (!authed) return;
    await withLoader("hydrate", async () => {
      const tasks = [
        fetchCurrentUser,
        fetchProfile,
        fetchDivisions,
        fetchTeams,
        fetchMetrics,
        fetchLogs,
        fetchAchievements,
        fetchTokens,
      ];
      const results = await Promise.allSettled(tasks.map((task) => task()));
      const failed = results.find((result) => result.status === "rejected");
      if (failed) {
        throw failed.reason;
      }
      setLastSynced(new Date());
    });
  }, [authed, fetchAchievements, fetchCurrentUser, fetchDivisions, fetchLogs, fetchMetrics, fetchProfile, fetchTeams, fetchTokens, withLoader]);

  const handleRegister = useCallback(
    async (payload) => {
      try {
        let greeting = "";
        await withLoader("register", async () => {
          const data = await apiRequest("/api/auth/register/", {
            method: "POST",
            body: payload,
          });
          greeting = data.user?.first_name || data.user?.email || payload.email;
          setToken(data.token);
          setUser(data.user);
        });
        await hydrate();
        pushToast(`Welcome aboard${greeting ? ` ${greeting}` : ""}!`.trim());
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, hydrate, pushToast, withLoader]
  );

  const handleLogin = useCallback(
    async (payload) => {
      try {
        let greeting = payload.email;
        await withLoader("login", async () => {
          const data = await apiRequest("/api/auth/login/", {
            method: "POST",
            body: payload,
          });
          greeting = data.user?.first_name || data.user?.email || payload.email;
          setToken(data.token);
          setUser(data.user);
        });
        await hydrate();
        pushToast(`Welcome back ${greeting}!`);
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, hydrate, pushToast, withLoader]
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setDivisions([]);
    setTeams([]);
    setMetrics([]);
    setLogs([]);
    setAchievements([]);
    setTokenSummary({ balance: 0, transactions: [] });
    setLastSynced(null);
    pushToast("Signed out");
  }, [pushToast]);

  const handleProfileSave = useCallback(
    async (formState) => {
      try {
        await withLoader("profile", async () => {
          const payload = {
            ...formState,
            public_profile: Boolean(formState.public_profile),
          };
          ["height_cm", "weight_kg", "graduation_year"].forEach((field) => {
            if (payload[field] === "") {
              payload[field] = null;
            } else if (payload[field] !== null) {
              payload[field] = Number(payload[field]);
            }
          });
          const updated = await apiRequest("/api/profile/", { method: "PUT", body: payload });
          setProfile(updated);
        });
        pushToast("Profile updated");
      } catch (error) {
        pushToast(error.message, "error");
      }
    },
    [apiRequest, pushToast, withLoader]
  );

  const handleCreateTeam = useCallback(
    async (payload) => {
      try {
        await withLoader("createTeam", async () => {
          const body = {
            ...payload,
            season_year: Number(payload.season_year),
          };
          await apiRequest("/api/teams/", { method: "POST", body });
        });
        pushToast("Team created");
        await Promise.all([fetchTeams(), fetchProfile()]);
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchProfile, fetchTeams, pushToast, withLoader]
  );

  const handleJoinTeam = useCallback(
    async (payload) => {
      try {
        await withLoader("joinTeam", async () => {
          await apiRequest(`/api/teams/${payload.team_id}/join/`, { method: "POST" });
        });
        pushToast("Join request submitted");
        await fetchTeams();
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchTeams, pushToast, withLoader]
  );

  const handleApproveCoach = useCallback(
    async (payload) => {
      try {
        await withLoader("approveCoach", async () => {
          await apiRequest(`/api/teams/${payload.team_id}/approve-coach/`, {
            method: "POST",
            body: { coach_id: payload.coach_id },
          });
        });
        pushToast("Coach approved");
        await fetchTeams();
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchTeams, pushToast, withLoader]
  );

  const handleMetricSave = useCallback(
    async (payload) => {
      try {
        await withLoader("metric", async () => {
          const body = {
            ...payload,
            value: Number(payload.value),
          };
          await apiRequest("/api/metrics/", { method: "POST", body });
        });
        pushToast("Metric saved");
        await fetchMetrics();
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchMetrics, pushToast, withLoader]
  );

  const handleMetricVerify = useCallback(
    async (id) => {
      const key = `verifyMetric-${id}`;
      try {
        await withLoader(key, async () => {
          await apiRequest(`/api/metrics/${id}/verify/`, { method: "POST" });
        });
        pushToast("Metric verified");
        await fetchMetrics();
      } catch (error) {
        pushToast(error.message, "error");
      }
    },
    [apiRequest, fetchMetrics, pushToast, withLoader]
  );

  const handleLogSave = useCallback(
    async (payload) => {
      try {
        await withLoader("log", async () => {
          const body = {
            ...payload,
            duration_minutes: Number(payload.duration_minutes),
          };
          await apiRequest("/api/training/", { method: "POST", body });
        });
        pushToast("Training log saved");
        await fetchLogs();
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchLogs, pushToast, withLoader]
  );

  const handleLogVerify = useCallback(
    async (id) => {
      const key = `verifyLog-${id}`;
      try {
        await withLoader(key, async () => {
          await apiRequest(`/api/training/${id}/verify/`, { method: "POST" });
        });
        pushToast("Log verified");
        await fetchLogs();
      } catch (error) {
        pushToast(error.message, "error");
      }
    },
    [apiRequest, fetchLogs, pushToast, withLoader]
  );

  const handleAwardAchievement = useCallback(
    async (payload) => {
      try {
        await withLoader("awardAchievement", async () => {
          await apiRequest("/api/achievements/award/", { method: "POST", body: payload });
        });
        pushToast("Achievement awarded");
        await Promise.all([fetchAchievements(), fetchTokens()]);
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchAchievements, fetchTokens, pushToast, withLoader]
  );

  const handleGrantTokens = useCallback(
    async (payload) => {
      try {
        await withLoader("grantTokens", async () => {
          const body = { ...payload, amount: Number(payload.amount) };
          await apiRequest("/api/tokens/", { method: "POST", body });
        });
        pushToast("Tokens granted");
        await fetchTokens();
        return true;
      } catch (error) {
        pushToast(error.message, "error");
        return false;
      }
    },
    [apiRequest, fetchTokens, pushToast, withLoader]
  );

  useEffect(() => {
    if (!authed) {
      setProfile(null);
      setDivisions([]);
      setTeams([]);
      setMetrics([]);
      setLogs([]);
      setAchievements([]);
      setTokenSummary({ balance: 0, transactions: [] });
      return;
    }
    hydrate().catch((error) => {
      pushToast(error.message, "error");
    });
  }, [authed, hydrate, pushToast]);

  const capabilityList = useMemo(() => {
    if (!user?.role) return [];
    return ROLE_CAPABILITIES[user.role] || [];
  }, [user]);

  return (
    <>
      <Header apiBase={apiBase} onApiBaseCommit={commitApiBase} authed={authed} onLogout={handleLogout} />
      <main className="app-layout">
        <Sidebar
          authed={authed}
          user={user}
          profile={profile}
          capabilities={capabilityList}
          lastSynced={lastSynced}
        />
        <section className="workspace" aria-live="polite">
          <Toast toast={toast} onDismiss={() => setToast(null)} />
          {!authed ? (
            <AuthPanel
              onRegister={handleRegister}
              onLogin={handleLogin}
              loadingRegister={isLoading("register")}
              loadingLogin={isLoading("login")}
            />
          ) : (
            <>
              <ProfilePanel profile={profile} onSubmit={handleProfileSave} loading={isLoading("profile") || isLoading("hydrate")} />
              <TeamsPanel
                divisions={divisions}
                teams={teams}
                canCreateTeam={hasRole("coach", "coordinator", "admin")}
                canJoinTeam={hasRole("player", "parent")}
                canApproveCoach={hasRole("coordinator", "admin")}
                onCreateTeam={handleCreateTeam}
                onJoinTeam={handleJoinTeam}
                onApproveCoach={handleApproveCoach}
                loadingCreate={isLoading("createTeam")}
                loadingJoin={isLoading("joinTeam")}
                loadingApprove={isLoading("approveCoach")}
              />
              <MetricsPanel
                metrics={metrics}
                onSubmit={handleMetricSave}
                onVerify={handleMetricVerify}
                canVerify={hasRole("coach", "coordinator", "admin")}
                loadingSubmit={isLoading("metric")}
                loadingVerify={(key) => isLoading(key)}
              />
              <TrainingPanel
                logs={logs}
                onSubmit={handleLogSave}
                onVerify={handleLogVerify}
                canVerify={hasRole("coach", "coordinator", "admin")}
                loadingSubmit={isLoading("log")}
                loadingVerify={(key) => isLoading(key)}
              />
              <AchievementsPanel
                achievements={achievements}
                tokenSummary={tokenSummary}
                canManage={hasRole("coach", "coordinator", "admin")}
                onAward={handleAwardAchievement}
                onGrant={handleGrantTokens}
                loadingAward={isLoading("awardAchievement")}
                loadingGrant={isLoading("grantTokens")}
              />
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
