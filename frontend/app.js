const { useState, useEffect, useMemo, useCallback } = React;

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

function useLocalStorageState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null || stored === "null" || stored === "undefined") {
        return initial;
      }
      return stored;
    } catch (err) {
      console.warn(`Failed to read ${key} from localStorage`, err);
      return initial;
    }
  });

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
}

function useLocalStorageJSON(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch (err) {
      console.warn(`Failed to parse ${key} from localStorage`, err);
      return initial;
    }
  });

  useEffect(() => {
    if (value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="toast-wrapper" role="status">
      <div className={`toast ${toast.type}`}>
        <span>{toast.message}</span>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function Header({
  apiBase,
  onApiBaseChange,
  onApiBaseBlur,
  onLogout,
  authed,
  user,
  hydrating,
}) {
  return (
    <header className="app-header">
      <div className="brand">
        <p className="eyebrow">Vancouver Baseball Connect</p>
        <h1>Unified baseball operations cockpit</h1>
        <p className="lede">
          Align players, coaches, coordinators, and parents with real-time insights
          and workflows tailored to their role.
        </p>
      </div>
      <div className="header-actions">
        <label className="input-chip">
          API Base
          <input
            type="text"
            value={apiBase}
            onChange={onApiBaseChange}
            onBlur={onApiBaseBlur}
            placeholder="https://api.example.com"
          />
        </label>
        {authed && (
          <div className="user-meta" aria-live="polite">
            <span className="avatar-fallback">
              {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </span>
            <div>
              <strong>{`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email}</strong>
              <p className="muted">{user?.role ? user.role.toUpperCase() : ""}</p>
            </div>
          </div>
        )}
        {authed && (
          <button type="button" className="ghost-button" onClick={onLogout}>
            Sign out
          </button>
        )}
        {hydrating && <span className="sync-chip">Syncing…</span>}
      </div>
    </header>
  );
}

function Sidebar({ authed, user, profile, roleCapabilities }) {
  return (
    <aside className="sidebar" aria-label="Account summary">
      <section className="card">
        <h2>Profile snapshot</h2>
        {authed && user ? (
          <div className="profile-card">
            <div className="avatar-ring">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={user.first_name || user.email} />
              ) : (
                <span>{user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <div>
              <p className="profile-name">{`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email}</p>
              <p className="muted">{user.email}</p>
              <p className="badge">{user.role}</p>
              <p className="muted">{user.bio || "Add a short bio to complete your presence."}</p>
            </div>
          </div>
        ) : (
          <p className="muted">Sign in to review personalized insights.</p>
        )}
      </section>

      <section className="card">
        <h2>Role access</h2>
        {authed && user ? (
          <ul className="stack-list">
            <li>
              <strong>Current role:</strong> {user.role.toUpperCase()}
            </li>
            {(roleCapabilities[user.role] || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Discover tailored workflows once authenticated.</p>
        )}
      </section>

      <section className="card">
        <h2>Operational health</h2>
        <ul className="stack-list">
          <li>✔️ Schema current (migrations applied)</li>
          <li>
            ✔️ API docs live at <code>/api/docs</code>
          </li>
          <li>
            ✔️ Tests: <code>pytest</code>
          </li>
        </ul>
      </section>
    </aside>
  );
}

function AuthPanel({ onRegister, onLogin }) {
  return (
    <section className="panel auth-panel">
      <header>
        <h2>Authentication</h2>
        <p>Register or sign in to unlock role-specific dashboards.</p>
      </header>
      <div className="panel-grid two-column">
        <form onSubmit={onRegister} className="card">
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
          <button type="submit" className="primary-button">
            Sign up
          </button>
        </form>

        <form onSubmit={onLogin} className="card">
          <h3>Sign in</h3>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="primary-button">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}

function ProfilePanel({ profile, onSubmit }) {
  const formKey = useMemo(() => JSON.stringify(profile || {}), [profile]);

  return (
    <section className="panel">
      <header>
        <div>
          <h2>My player profile</h2>
          <p>Keep roster-ready details polished and up to date.</p>
        </div>
      </header>
      <form key={formKey} onSubmit={onSubmit} className="panel-grid">
        <label>
          Position
          <input name="position" defaultValue={profile?.position || ""} />
        </label>
        <div className="field-row">
          <label>
            Bats
            <select name="bats" defaultValue={profile?.bats || ""}>
              <option value="">-</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
              <option value="S">Switch</option>
            </select>
          </label>
          <label>
            Throws
            <select name="throws" defaultValue={profile?.throws || ""}>
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
              defaultValue={profile?.height_cm || ""}
            />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              name="weight_kg"
              min="0"
              defaultValue={profile?.weight_kg || ""}
            />
          </label>
        </div>
        <label>
          Graduation year
          <input
            type="number"
            name="graduation_year"
            min="2024"
            defaultValue={profile?.graduation_year || ""}
          />
        </label>
        <label>
          School
          <input name="school" defaultValue={profile?.school || ""} />
        </label>
        <label>
          Avatar URL
          <input name="avatar_url" type="url" defaultValue={profile?.avatar_url || ""} />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="public_profile"
            defaultChecked={Boolean(profile?.public_profile)}
          />
          Public profile
        </label>
        <div className="actions">
          <button className="primary-button">Save profile</button>
        </div>
      </form>
    </section>
  );
}

function TeamsPanel({
  divisions,
  teams,
  hasRole,
  onCreateTeam,
  onJoinTeam,
  onApproveCoach,
}) {
  return (
    <section className="panel">
      <header>
        <div>
          <h2>Teams & divisions</h2>
          <p>Manage rosters, approvals, and enrollment pathways.</p>
        </div>
      </header>
      <div className="panel-grid two-column">
        {hasRole("coach", "coordinator", "admin") && (
          <form onSubmit={onCreateTeam} className="card">
            <h3>Create team</h3>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Season year
              <input type="number" name="season_year" required />
            </label>
            <label>
              Division
              <select name="division" required defaultValue="">
                <option value="" disabled>
                  Select division
                </option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Description
              <textarea name="description" rows="2"></textarea>
            </label>
            <button className="primary-button">Create team</button>
          </form>
        )}

        {hasRole("player", "parent") && (
          <form onSubmit={onJoinTeam} className="card">
            <h3>Join team</h3>
            <label>
              Team ID
              <input name="team_id" required />
            </label>
            <button className="primary-button">Request join</button>
          </form>
        )}

        {hasRole("coordinator", "admin") && (
          <form onSubmit={onApproveCoach} className="card">
            <h3>Approve coach</h3>
            <label>
              Team ID
              <input name="team_id" required />
            </label>
            <label>
              Coach ID
              <input name="coach_id" required />
            </label>
            <button className="primary-button">Approve</button>
          </form>
        )}
      </div>

      <div className="data-grid">
        <div className="card">
          <h3>Divisions</h3>
          <ul className="stack-list">
            {divisions.length === 0 && <li className="muted">No divisions available.</li>}
            {divisions.map((division) => (
              <li key={division.id}>
                <strong>{division.name}</strong>
                <br />
                <span className="muted">{division.league_type}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Teams</h3>
          <ul className="stack-list">
            {teams.length === 0 && <li className="muted">No teams yet.</li>}
            {teams.map((team) => (
              <li key={team.id}>
                <strong>{team.name}</strong> • {team.season_year}
                <br />
                <span className="muted">{team.division_detail?.name || "Division"}</span>
                <br />
                <span className="badge">{team.roster_count} players</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MetricsPanel({ metrics, hasRole, onSaveMetric, onVerifyMetric }) {
  return (
    <section className="panel">
      <header>
        <div>
          <h2>Performance metrics</h2>
          <p>Track velocity, pop time, and other verified stats.</p>
        </div>
      </header>
      <div className="panel-grid two-column">
        <form onSubmit={onSaveMetric} className="card">
          <h3>Add / update metric</h3>
          <label>
            Type
            <select name="metric_type" defaultValue="fastball_velocity">
              <option value="fastball_velocity">Fastball Velocity</option>
              <option value="exit_velocity">Exit Velocity</option>
              <option value="pop_time">Pop Time</option>
              <option value="sixty_yard_dash">60 Yard Dash</option>
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
          <button className="primary-button">Save metric</button>
        </form>
        <div className="card">
          <h3>My metrics</h3>
          <ul className="stack-list">
            {metrics.length === 0 && <li className="muted">No metrics yet.</li>}
            {metrics.map((metric) => {
              const isVerified = metric.is_verified;
              return (
                <li key={metric.id} className="metric-item">
                  <div>
                    <strong>{metric.metric_type.replace(/_/g, " ")}</strong> — {metric.value}
                    {metric.unit ? ` ${metric.unit}` : ""}
                  </div>
                  <p className="muted">
                    Updated {new Date(metric.created_at).toLocaleDateString()}
                  </p>
                  <div className="metric-actions">
                    <span className={`badge ${isVerified ? "success" : "warning"}`}>
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                    {hasRole("coach", "coordinator", "admin") && !isVerified && (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => onVerifyMetric(metric.id)}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TrainingPanel({ logs, hasRole, onSaveLog, onVerifyLog }) {
  return (
    <section className="panel">
      <header>
        <div>
          <h2>Training log</h2>
          <p>Document workouts and request verifications.</p>
        </div>
      </header>
      <div className="panel-grid two-column">
        <form onSubmit={onSaveLog} className="card">
          <h3>Log session</h3>
          <label>
            Activity
            <select name="activity_type" defaultValue="throwing">
              <option value="throwing">Throwing</option>
              <option value="hitting">Hitting</option>
              <option value="running">Running</option>
              <option value="strength">Strength</option>
              <option value="mobility">Mobility</option>
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
          <button className="primary-button">Save log</button>
        </form>
        <div className="card">
          <h3>Recent sessions</h3>
          <ul className="stack-list">
            {logs.length === 0 && <li className="muted">No training logs yet.</li>}
            {logs.map((log) => {
              const isVerified = log.is_verified;
              return (
                <li key={log.id} className="metric-item">
                  <div>
                    <strong>{log.activity_type}</strong> • {log.duration_minutes} min on {log.date}
                  </div>
                  <p className="muted">{log.notes || "No notes"}</p>
                  <div className="metric-actions">
                    <span className={`badge ${isVerified ? "success" : "warning"}`}>
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                    {hasRole("coach", "coordinator", "admin") && !isVerified && (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => onVerifyLog(log.id)}
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AchievementsPanel({
  achievements,
  tokens,
  hasRole,
  onAwardAchievement,
  onGrantTokens,
}) {
  return (
    <section className="panel">
      <header>
        <div>
          <h2>Achievements & tokens</h2>
          <p>Celebrate milestones and manage token rewards.</p>
        </div>
      </header>
      <div className="panel-grid two-column">
        <div className="card">
          <h3>My achievements</h3>
          <ul className="stack-list">
            {achievements.length === 0 && <li className="muted">No achievements awarded yet.</li>}
            {achievements.map((item) => (
              <li key={item.id || `${item.profile}_${item.achievement?.id}`}
              >
                <strong>{item.achievement?.name || "Achievement"}</strong> (tokens: {item.achievement?.token_reward})
                <br />
                <span className="muted">
                  Awarded {new Date(item.awarded_at).toLocaleDateString()}
                </span>
                <br />
                <span className="muted">{item.notes || ""}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Token wallet</h3>
          <div className="token-balance">Balance: {tokens.balance}</div>
          <ul className="stack-list">
            {tokens.transactions.length === 0 && <li className="muted">No token history yet.</li>}
            {tokens.transactions.map((tx) => (
              <li key={tx.id || tx.created_at}>
                <strong>{tx.amount > 0 ? "+" : ""}{tx.amount} tokens</strong>
                <br />
                <span className="muted">{tx.reason}</span>
                <br />
                <span className="muted">{new Date(tx.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel-grid two-column">
        {hasRole("coach", "coordinator", "admin") && (
          <form onSubmit={onAwardAchievement} className="card">
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
            <button className="primary-button">Award</button>
          </form>
        )}
        {hasRole("coach", "coordinator", "admin") && (
          <form onSubmit={onGrantTokens} className="card">
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
            <button className="primary-button">Grant</button>
          </form>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <p>
        Built for the Vancouver Baseball Connect MVP — Django backend at <code>/api/</code>,
        frontend served as static assets. Contributions welcome via AGENTS guidelines.
      </p>
    </footer>
  );
}

function App() {
  const [apiBase, setApiBase] = useLocalStorageState(storageKeys.apiBase, "http://localhost:8000");
  const [token, setToken] = useLocalStorageState(storageKeys.token, null);
  const [user, setUser] = useLocalStorageJSON(storageKeys.user, null);
  const [profile, setProfile] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tokensData, setTokensData] = useState({ balance: 0, transactions: [] });
  const [toast, setToast] = useState(null);
  const [hydrating, setHydrating] = useState(false);

  const authed = Boolean(token && user);

  const normalizedApiBase = useMemo(() => (apiBase || "").trim().replace(/\/$/, ""), [apiBase]);

  const pushToast = useCallback((message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const apiRequest = useCallback(
    async (path, { method = "GET", body, headers = {} } = {}) => {
      if (!normalizedApiBase) {
        throw new Error("API base URL not configured.");
      }
      const options = { method, headers: { ...headers } };
      if (token) {
        options.headers.Authorization = `Token ${token}`;
      }
      if (body && !(body instanceof FormData)) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      } else if (body) {
        options.body = body;
      }
      const response = await fetch(`${normalizedApiBase}${path}`, options).catch((error) => {
        throw new Error(`Network error: ${error.message}`);
      });
      if (!response.ok) {
        let detail = "";
        try {
          const data = await response.json();
          detail = data.detail || JSON.stringify(data);
        } catch {
          detail = await response.text();
        }
        throw new Error(detail || `Request failed (${response.status})`);
      }
      if (response.status === 204) return null;
      return response.json();
    },
    [normalizedApiBase, token]
  );

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

  const fetchCurrentUser = useCallback(async () => {
    const data = await apiRequest("/api/auth/me/");
    setUser(data);
    return data;
  }, [apiRequest, setUser]);

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
    setTokensData(data);
    return data;
  }, [apiRequest]);

  const hydrate = useCallback(async () => {
    if (!authed) return;
    setHydrating(true);
    try {
      await Promise.all([
        fetchCurrentUser(),
        fetchProfile(),
        fetchDivisions(),
        fetchTeams(),
        fetchMetrics(),
        fetchLogs(),
        fetchAchievements(),
        fetchTokens(),
      ]);
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setHydrating(false);
    }
  }, [authed, fetchAchievements, fetchCurrentUser, fetchDivisions, fetchLogs, fetchMetrics, fetchProfile, fetchTeams, fetchTokens, pushToast]);

  useEffect(() => {
    if (authed) {
      hydrate();
    } else {
      setProfile(null);
      setDivisions([]);
      setTeams([]);
      setMetrics([]);
      setLogs([]);
      setAchievements([]);
      setTokensData({ balance: 0, transactions: [] });
    }
  }, [authed, hydrate]);

  const handleApiBaseChange = useCallback((event) => {
    setApiBase(event.target.value);
  }, [setApiBase]);

  const handleApiBaseBlur = useCallback(() => {
    setApiBase((value) => (value || "").trim().replace(/\/$/, ""));
    pushToast(`API base set to ${(apiBase || "").trim().replace(/\/$/, "")}`, "success");
  }, [apiBase, pushToast, setApiBase]);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setProfile(null);
    setTeams([]);
    setMetrics([]);
    setLogs([]);
    setAchievements([]);
    setTokensData({ balance: 0, transactions: [] });
    pushToast("Signed out", "success");
  }, [pushToast, setToken, setUser]);

  const handleRegister = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const data = await apiRequest("/api/auth/register/", { method: "POST", body: payload });
      setToken(data.token);
      setUser(data.user);
      event.currentTarget.reset();
      pushToast("Welcome aboard! Account created.", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, pushToast, setToken, setUser]);

  const handleLogin = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const data = await apiRequest("/api/auth/login/", { method: "POST", body: payload });
      setToken(data.token);
      setUser(data.user);
      event.currentTarget.reset();
      pushToast(`Welcome back ${data.user.first_name || ""}`.trim(), "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, pushToast, setToken, setUser]);

  const handleProfileSave = useCallback(async (event) => {
    event.preventDefault();
    if (!profile) return;
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.public_profile = formData.get("public_profile") === "on";
    ["height_cm", "weight_kg", "graduation_year"].forEach((field) => {
      if (payload[field] === "") payload[field] = null;
    });
    try {
      const updated = await apiRequest("/api/profile/", { method: "PUT", body: payload });
      setProfile(updated);
      pushToast("Profile updated", "success");
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, profile, pushToast]);

  const handleCreateTeam = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.season_year = Number(payload.season_year);
    try {
      await apiRequest("/api/teams/", { method: "POST", body: payload });
      event.currentTarget.reset();
      pushToast("Team created", "success");
      await Promise.all([fetchTeams(), fetchProfile()]);
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchProfile, fetchTeams, pushToast]);

  const handleJoinTeam = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { team_id } = Object.fromEntries(formData.entries());
    try {
      await apiRequest(`/api/teams/${team_id}/join/`, { method: "POST" });
      event.currentTarget.reset();
      pushToast("Join request submitted", "success");
      await fetchTeams();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchTeams, pushToast]);

  const handleApproveCoach = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { team_id, coach_id } = Object.fromEntries(formData.entries());
    try {
      await apiRequest(`/api/teams/${team_id}/approve-coach/`, {
        method: "POST",
        body: { coach_id },
      });
      event.currentTarget.reset();
      pushToast("Coach approved", "success");
      await fetchTeams();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchTeams, pushToast]);

  const handleMetricSave = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.value = Number(payload.value);
    try {
      await apiRequest("/api/metrics/", { method: "POST", body: payload });
      event.currentTarget.reset();
      pushToast("Metric saved", "success");
      await fetchMetrics();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchMetrics, pushToast]);

  const handleLogSave = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.duration_minutes = Number(payload.duration_minutes);
    try {
      await apiRequest("/api/training/", { method: "POST", body: payload });
      event.currentTarget.reset();
      pushToast("Training log saved", "success");
      await fetchLogs();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchLogs, pushToast]);

  const handleAwardAchievement = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      await apiRequest("/api/achievements/award/", { method: "POST", body: payload });
      event.currentTarget.reset();
      pushToast("Achievement awarded", "success");
      await Promise.all([fetchAchievements(), fetchTokens()]);
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchAchievements, fetchTokens, pushToast]);

  const handleGrantTokens = useCallback(async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    payload.amount = Number(payload.amount);
    try {
      await apiRequest("/api/tokens/", { method: "POST", body: payload });
      event.currentTarget.reset();
      pushToast("Tokens granted", "success");
      await fetchTokens();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchTokens, pushToast]);

  const handleVerifyMetric = useCallback(async (id) => {
    try {
      await apiRequest(`/api/metrics/${id}/verify/`, { method: "POST" });
      pushToast("Metric verified", "success");
      await fetchMetrics();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchMetrics, pushToast]);

  const handleVerifyLog = useCallback(async (id) => {
    try {
      await apiRequest(`/api/training/${id}/verify/`, { method: "POST" });
      pushToast("Log verified", "success");
      await fetchLogs();
    } catch (error) {
      pushToast(error.message, "error");
    }
  }, [apiRequest, fetchLogs, pushToast]);

  return (
    <div className="app-shell">
      <Header
        apiBase={apiBase || ""}
        onApiBaseChange={handleApiBaseChange}
        onApiBaseBlur={handleApiBaseBlur}
        onLogout={handleLogout}
        authed={authed}
        user={user}
        hydrating={hydrating}
      />
      <div className="app-layout">
        <Sidebar
          authed={authed}
          user={user}
          profile={profile}
          roleCapabilities={ROLE_CAPABILITIES}
        />
        <main className="workspace" aria-live="polite">
          <Toast toast={toast} onDismiss={() => setToast(null)} />
          {!authed ? (
            <AuthPanel onRegister={handleRegister} onLogin={handleLogin} />
          ) : (
            <>
              <ProfilePanel profile={profile} onSubmit={handleProfileSave} />
              <TeamsPanel
                divisions={divisions}
                teams={teams}
                hasRole={hasRole}
                onCreateTeam={handleCreateTeam}
                onJoinTeam={handleJoinTeam}
                onApproveCoach={handleApproveCoach}
              />
              <MetricsPanel
                metrics={metrics}
                hasRole={hasRole}
                onSaveMetric={handleMetricSave}
                onVerifyMetric={handleVerifyMetric}
              />
              <TrainingPanel
                logs={logs}
                hasRole={hasRole}
                onSaveLog={handleLogSave}
                onVerifyLog={handleVerifyLog}
              />
              <AchievementsPanel
                achievements={achievements}
                tokens={tokensData}
                hasRole={hasRole}
                onAwardAchievement={handleAwardAchievement}
                onGrantTokens={handleGrantTokens}
              />
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  ReactDOM.render(<App />, rootElement);
}
