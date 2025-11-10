const { useState, useEffect, useMemo, useCallback } = React;

const storageKeys = {
  apiBase: "vbconnect:apiBase",
  token: "vbconnect:token",
  user: "vbconnect:user",
};

const DEFAULT_API_BASE = "http://localhost:8000";

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

const panelIcons = {
  auth: (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M12 2a5 5 0 0 0-5 5v2.2c0 .5-.2 1-.6 1.4L4.4 12c-.3.3-.4.7-.4 1.1V18c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4v-4.9c0-.4-.1-.8-.4-1.1l-2-2c-.4-.4-.6-.9-.6-1.4V7a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3v2.2c0 1 .4 1.9 1.1 2.6l1.5 1.5V18c0 1.1-.9 2-2 2H8a2 2 0 0 1-2-2v-4.7l1.4-1.5c.7-.7 1.1-1.6 1.1-2.6V7a3 3 0 0 1 3-3Zm0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
    </svg>
  ),
  profile: (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c-4.4 0-8 2.7-8 6v2h16v-2c0-3.3-3.6-6-8-6Zm0 2c3.3 0 6 1.9 6 4v.1H6V20c0-2.1 2.7-4 6-4Z"
      />
    </svg>
  ),
  teams: (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M6 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm12 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM6 13c-3.3 0-6 2.1-6 4.7V21h6v-2H2v-1.3C2 16.6 3.8 15 6 15s4 1.6 4 2.7V21h2v-3.3C12 15.1 9.3 13 6 13Zm12 0c-3.3 0-6 2.1-6 4.7V21h10v-3.3c0-2.6-2.7-4.7-4-4.7Zm0 2c2.2 0 4 1.6 4 2.7V19h-6v-1.3c0-1.1 1.8-2.7 4-2.7Z"
      />
    </svg>
  ),
  metrics: (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M4 4a2 2 0 0 0-2 2v12h2V6h2v12h2V8h2v10h2V10h2v8h2v-6h2v6h2V6a2 2 0 0 0-2-2H4Z"
      />
    </svg>
  ),
  training: (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M7 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H7Zm0 2h10a1 1 0 0 1 1 1v1H6V5a1 1 0 0 1 1-1Zm-1 4h12v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8Zm3 2v2h6v-2H9Zm0 4v2h6v-2H9Z"
      />
    </svg>
  ),
  achievements: (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M12 2a5 5 0 0 0-5 5v1.1a5 5 0 0 0-2.4 4.2c0 2 1.2 3.8 3 4.6V23l4-2 4 2v-6.1c1.8-.8 3-2.6 3-4.6a5 5 0 0 0-2.4-4.2V7a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3v1.8l.6.3A3 3 0 0 1 18 12c0 1.4-1 2.6-2.4 2.9l-.6.1V19l-2-1-2 1v-4c-1.8-.2-3.2-1.7-3.2-3.5 0-1.2.7-2.4 1.8-3l.6-.3V7a3 3 0 0 1 3-3Zm0 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      />
    </svg>
  ),
};

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className={`toast ${toast.tone}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        &times;
      </button>
    </div>
  );
};

const LoadingState = ({ label = "Loading" }) => (
  <div className="loading-state" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true"></span>
    <span>{label}</span>
  </div>
);

const EmptyState = ({ headline, description, action }) => (
  <div className="empty-state">
    <h4>{headline}</h4>
    {description && <p className="muted">{description}</p>}
    {action}
  </div>
);

const WorkspaceNav = ({ panels, activePanel, onSelect }) => (
  <nav className="workspace-nav" aria-label="Workspace sections">
    {panels.map((panel) => (
      <button
        key={panel.id}
        type="button"
        className={activePanel === panel.id ? "active" : ""}
        onClick={() => onSelect(panel.id)}
      >
        {panel.icon}
        <span>
          <strong>{panel.label}</strong>
          <small>{panel.helper}</small>
        </span>
      </button>
    ))}
  </nav>
);

const Panel = ({ id, title, description, children, active, badge, loading }) => (
  <section
    className="panel"
    id={`${id}-panel`}
    role="group"
    aria-labelledby={`${id}-title`}
    hidden={!active}
  >
    <header>
      <div className="panel-header">
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          {description && <p className="muted">{description}</p>}
        </div>
        {badge}
      </div>
    </header>
    {loading ? <LoadingState /> : children}
  </section>
);

const ProfileSnapshot = ({ user, profile, onLogout, authed }) => {
  const avatarUrl = profile?.avatar_url;
  return (
    <section className="card profile-card" aria-live="polite">
      <div className="profile-card-header">
        <div className="avatar" aria-hidden="true">
          {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{user?.first_name?.[0] || "?"}</span>}
        </div>
        <div>
          <h2>{authed ? `${user?.first_name || "Player"} ${user?.last_name || ""}` : "Profile Snapshot"}</h2>
          <p className="muted">{authed ? user?.email : "Sign in to load details."}</p>
        </div>
      </div>
      {authed ? (
        <>
          <p className="muted">{user?.bio || "Add a short bio so coaches know your story."}</p>
          <span className="badge">{user?.role || "role"}</span>
          <button type="button" className="ghost-button" onClick={onLogout}>
            Sign out
          </button>
        </>
      ) : (
        <p className="muted">Create an account to sync achievements and training data.</p>
      )}
    </section>
  );
};

const RoleAccessCard = ({ role, capabilities }) => (
  <section className="card compact">
    <h2>Role Access</h2>
    {role ? (
      <ul className="stack-list">
        <li>
          <strong>Current role:</strong> {role.toUpperCase()}
        </li>
        {capabilities.map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
    ) : (
      <p className="muted">Sign in to view tailored capabilities.</p>
    )}
  </section>
);

const QuickChecksCard = () => (
  <section className="card compact">
    <h2>Quick Checks</h2>
    <ul className="stack-list">
      <li>✔️ Schema current (migrations applied)</li>
      <li>✔️ API docs live at <code>/api/docs</code></li>
      <li>✔️ Tests: <code>pytest</code></li>
    </ul>
  </section>
);

function App() {
  const [apiBase, setApiBase] = useState(
    () => localStorage.getItem(storageKeys.apiBase) || DEFAULT_API_BASE
  );
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(storageKeys.user);
    return stored ? JSON.parse(stored) : null;
  });
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState({
    position: "",
    bats: "",
    throws: "",
    height_cm: "",
    weight_kg: "",
    graduation_year: "",
    school: "",
    avatar_url: "",
    public_profile: false,
  });
  const [divisions, setDivisions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tokens, setTokens] = useState({ balance: 0, transactions: [] });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [activePanel, setActivePanel] = useState(token && user ? "profile" : "auth");

  const authed = Boolean(token && user);

  const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

  useEffect(() => {
    localStorage.setItem(storageKeys.apiBase, apiBase.trim());
  }, [apiBase]);

  const persistAuth = useCallback(
    (nextToken, nextUser) => {
      if (nextToken) {
        localStorage.setItem(storageKeys.token, nextToken);
      } else {
        localStorage.removeItem(storageKeys.token);
      }
      if (nextUser) {
        localStorage.setItem(storageKeys.user, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(storageKeys.user);
      }
    },
    []
  );

  const showToast = useCallback((message, tone = "success") => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  const apiRequest = useCallback(
    async (path, { method = "GET", body, headers = {} } = {}) => {
      const base = apiBase.replace(/\/$/, "");
      if (!base) throw new Error("API base URL not configured");
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
      let response;
      try {
        response = await fetch(`${base}${path}`, options);
      } catch (error) {
        throw new Error(`Network error: ${error.message}`);
      }
      if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try {
          const data = await response.json();
          detail = data.detail || JSON.stringify(data);
        } catch (err) {
          try {
            detail = await response.text();
          } catch (err2) {
            // ignore secondary parsing errors
          }
        }
        throw new Error(detail);
      }
      if (response.status === 204) return null;
      return response.json();
    },
    [apiBase, token]
  );

  const hydrate = useCallback(async () => {
    if (!token) return;
    setIsHydrating(true);
    try {
      const [
        userData,
        profileData,
        divisionData,
        teamData,
        metricData,
        logData,
        achievementData,
        tokenData,
      ] = await Promise.all([
        apiRequest("/api/auth/me/"),
        apiRequest("/api/profile/"),
        apiRequest("/api/divisions/"),
        apiRequest("/api/teams/"),
        apiRequest("/api/metrics/"),
        apiRequest("/api/training/"),
        apiRequest("/api/achievements/"),
        apiRequest("/api/tokens/"),
      ]);
      setUser(userData);
      persistAuth(token, userData);
      setProfile(profileData);
      setDivisions(divisionData);
      setTeams(teamData);
      setMetrics(metricData);
      setLogs(logData);
      setAchievements(achievementData);
      setTokens(tokenData);
      showToast("Workspace synced with the latest data.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsHydrating(false);
    }
  }, [apiRequest, persistAuth, showToast, token]);

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
      setTokens({ balance: 0, transactions: [] });
    }
  }, [authed, hydrate]);

  useEffect(() => {
    if (profile) {
      setProfileDraft({
        position: profile.position || "",
        bats: profile.bats || "",
        throws: profile.throws || "",
        height_cm: profile.height_cm ?? "",
        weight_kg: profile.weight_kg ?? "",
        graduation_year: profile.graduation_year ?? "",
        school: profile.school || "",
        avatar_url: profile.avatar_url || "",
        public_profile: Boolean(profile.public_profile),
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!authed) {
      setProfileDraft({
        position: "",
        bats: "",
        throws: "",
        height_cm: "",
        weight_kg: "",
        graduation_year: "",
        school: "",
        avatar_url: "",
        public_profile: false,
      });
    }
  }, [authed]);

  const resetAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    persistAuth(null, null);
    setActivePanel("auth");
    showToast("Signed out", "success");
  }, [persistAuth, showToast]);

  const handleRegister = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    setSubmitting("register");
    try {
      const data = await apiRequest("/api/auth/register/", { method: "POST", body: payload });
      setToken(data.token);
      setUser(data.user);
      persistAuth(data.token, data.user);
      showToast("Welcome aboard! Account created.");
      setActivePanel("profile");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    setSubmitting("login");
    try {
      const data = await apiRequest("/api/auth/login/", { method: "POST", body: payload });
      setToken(data.token);
      setUser(data.user);
      persistAuth(data.token, data.user);
      showToast(`Welcome back ${data.user.first_name || ""}`.trim());
      setActivePanel("profile");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSubmitting("profile");
    const payload = {
      ...profileDraft,
      public_profile: Boolean(profileDraft.public_profile),
    };
    ["height_cm", "weight_kg", "graduation_year"].forEach((field) => {
      if (payload[field] === "") payload[field] = null;
    });
    try {
      const updated = await apiRequest("/api/profile/", { method: "PUT", body: payload });
      setProfile(updated);
      showToast("Profile updated");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleCreateTeam = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.season_year = Number(payload.season_year);
    setSubmitting("create-team");
    try {
      await apiRequest("/api/teams/", { method: "POST", body: payload });
      showToast("Team created");
      event.target.reset();
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleJoinTeam = async (event) => {
    event.preventDefault();
    const { team_id } = Object.fromEntries(new FormData(event.target).entries());
    setSubmitting("join-team");
    try {
      await apiRequest(`/api/teams/${team_id}/join/`, { method: "POST" });
      showToast("Join request submitted");
      event.target.reset();
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleApproveCoach = async (event) => {
    event.preventDefault();
    const { team_id, coach_id } = Object.fromEntries(new FormData(event.target).entries());
    setSubmitting("approve-coach");
    try {
      await apiRequest(`/api/teams/${team_id}/approve-coach/`, {
        method: "POST",
        body: { coach_id },
      });
      showToast("Coach approved");
      event.target.reset();
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleMetricSave = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.value = Number(payload.value);
    setSubmitting("metrics");
    try {
      await apiRequest("/api/metrics/", { method: "POST", body: payload });
      showToast("Metric saved");
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleVerifyMetric = async (id) => {
    setSubmitting(`verify-metric-${id}`);
    try {
      await apiRequest(`/api/metrics/${id}/verify/`, { method: "POST" });
      showToast("Metric verified");
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleLogSave = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.duration_minutes = Number(payload.duration_minutes);
    setSubmitting("training");
    try {
      await apiRequest("/api/training/", { method: "POST", body: payload });
      showToast("Training log saved");
      event.target.reset();
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleVerifyLog = async (id) => {
    setSubmitting(`verify-log-${id}`);
    try {
      await apiRequest(`/api/training/${id}/verify/`, { method: "POST" });
      showToast("Training log verified");
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleAwardAchievement = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    setSubmitting("award");
    try {
      await apiRequest("/api/achievements/award/", { method: "POST", body: payload });
      showToast("Achievement awarded");
      event.target.reset();
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const handleGrantTokens = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.amount = Number(payload.amount);
    setSubmitting("grant-tokens");
    try {
      await apiRequest("/api/tokens/", { method: "POST", body: payload });
      showToast("Tokens granted");
      event.target.reset();
      await hydrate();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(null);
    }
  };

  const capabilities = useMemo(() => ROLE_CAPABILITIES[user?.role] || [], [user]);

  const panels = useMemo(() => {
    const basePanels = authed
      ? [
          {
            id: "profile",
            label: "Profile",
            helper: "Player identity",
            icon: panelIcons.profile,
            render: () => (
              <Panel
                id="profile"
                title="My Player Profile"
                description="Update roster-ready details shown on dashboards."
                active={activePanel === "profile"}
                loading={isHydrating && !profile}
              >
                <form className="panel-grid" onSubmit={handleProfileSave}>
                  <label>
                    Position
                    <input
                      name="position"
                      value={profileDraft.position}
                      onChange={(event) =>
                        setProfileDraft((draft) => ({ ...draft, position: event.target.value }))
                      }
                      placeholder="e.g. Pitcher"
                    />
                  </label>
                  <div className="field-row">
                    <label>
                      Bats
                      <select
                        name="bats"
                        value={profileDraft.bats}
                        onChange={(event) =>
                          setProfileDraft((draft) => ({ ...draft, bats: event.target.value }))
                        }
                      >
                        <option value="">-</option>
                        <option value="R">Right</option>
                        <option value="L">Left</option>
                        <option value="S">Switch</option>
                      </select>
                    </label>
                    <label>
                      Throws
                      <select
                        name="throws"
                        value={profileDraft.throws}
                        onChange={(event) =>
                          setProfileDraft((draft) => ({ ...draft, throws: event.target.value }))
                        }
                      >
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
                        value={profileDraft.height_cm}
                        onChange={(event) =>
                          setProfileDraft((draft) => ({ ...draft, height_cm: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      Weight (kg)
                      <input
                        type="number"
                        name="weight_kg"
                        min="0"
                        value={profileDraft.weight_kg}
                        onChange={(event) =>
                          setProfileDraft((draft) => ({ ...draft, weight_kg: event.target.value }))
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Graduation year
                    <input
                      type="number"
                      name="graduation_year"
                      min="2024"
                      value={profileDraft.graduation_year}
                      onChange={(event) =>
                        setProfileDraft((draft) => ({
                          ...draft,
                          graduation_year: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    School
                    <input
                      name="school"
                      value={profileDraft.school}
                      onChange={(event) =>
                        setProfileDraft((draft) => ({ ...draft, school: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Avatar URL
                    <input
                      type="url"
                      name="avatar_url"
                      placeholder="https://"
                      value={profileDraft.avatar_url}
                      onChange={(event) =>
                        setProfileDraft((draft) => ({ ...draft, avatar_url: event.target.value }))
                      }
                    />
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      name="public_profile"
                      checked={profileDraft.public_profile}
                      onChange={(event) =>
                        setProfileDraft((draft) => ({
                          ...draft,
                          public_profile: event.target.checked,
                        }))
                      }
                    />
                    Public profile
                  </label>
                  <button className="primary-button" disabled={submitting === "profile"}>
                    {submitting === "profile" ? "Saving..." : "Save profile"}
                  </button>
                </form>
              </Panel>
            ),
          },
          {
            id: "teams",
            label: "Teams",
            helper: "Rosters & approvals",
            icon: panelIcons.teams,
            render: () => (
              <Panel
                id="teams"
                title="Teams & Divisions"
                description="Manage rosters, approvals, and team enrollment."
                active={activePanel === "teams"}
                loading={isHydrating && !teams.length && !divisions.length}
              >
                <div className="panel-grid">
                  {hasRole("coach", "coordinator", "admin") && (
                    <form onSubmit={handleCreateTeam}>
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
                      <button className="primary-button" disabled={submitting === "create-team"}>
                        {submitting === "create-team" ? "Creating..." : "Create team"}
                      </button>
                    </form>
                  )}

                  {hasRole("player", "parent") && (
                    <form onSubmit={handleJoinTeam}>
                      <h3>Join team</h3>
                      <label>
                        Team ID
                        <input name="team_id" required />
                      </label>
                      <button className="primary-button" disabled={submitting === "join-team"}>
                        {submitting === "join-team" ? "Requesting..." : "Request join"}
                      </button>
                    </form>
                  )}

                  {hasRole("coordinator", "admin") && (
                    <form onSubmit={handleApproveCoach}>
                      <h3>Approve coach</h3>
                      <label>
                        Team ID
                        <input name="team_id" required />
                      </label>
                      <label>
                        Coach ID
                        <input name="coach_id" required />
                      </label>
                      <button className="primary-button" disabled={submitting === "approve-coach"}>
                        {submitting === "approve-coach" ? "Approving..." : "Approve"}
                      </button>
                    </form>
                  )}
                </div>
                <div className="data-grid">
                  <div>
                    <h3>Divisions</h3>
                    {divisions.length ? (
                      <ul className="stack-list">
                        {divisions.map((division) => (
                          <li key={division.id}>
                            <strong>{division.name}</strong>
                            <br />
                            <span className="muted">{division.league_type}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyState
                        headline="No divisions yet"
                        description="Coordinators can create divisions from the backend."
                      />
                    )}
                  </div>
                  <div>
                    <h3>Teams</h3>
                    {teams.length ? (
                      <ul className="stack-list">
                        {teams.map((team) => (
                          <li key={team.id}>
                            <strong>
                              {team.name} • {team.season_year}
                            </strong>
                            <br />
                            <span className="muted">
                              {team.division_detail?.name || "Division pending"}
                            </span>
                            <br />
                            <span className="badge">{team.roster_count} players</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyState
                        headline="No teams to display"
                        description="Once coaches create teams, they'll appear here."
                      />
                    )}
                  </div>
                </div>
              </Panel>
            ),
          },
          {
            id: "metrics",
            label: "Metrics",
            helper: "Player outputs",
            icon: panelIcons.metrics,
            render: () => (
              <Panel
                id="metrics"
                title="Performance Metrics"
                description="Track velocity, pop time, and other verified stats."
                active={activePanel === "metrics"}
                loading={isHydrating && !metrics.length}
              >
                <div className="panel-grid">
                  <form onSubmit={handleMetricSave}>
                    <h3>Add / update metric</h3>
                    <label>
                      Type
                      <select name="metric_type">
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
                    <button className="primary-button" disabled={submitting === "metrics"}>
                      {submitting === "metrics" ? "Saving..." : "Save metric"}
                    </button>
                  </form>
                  <div>
                    <h3>My metrics</h3>
                    {metrics.length ? (
                      <ul className="stack-list">
                        {metrics.map((metric) => {
                          const verifying = submitting === `verify-metric-${metric.id}`;
                          return (
                            <li key={metric.id}>
                              <strong>{metric.metric_type.replace(/_/g, " ")}</strong> — {metric.value}{" "}
                              {metric.unit || ""}
                              <br />
                              <span className="muted">
                                Updated {new Date(metric.created_at).toLocaleDateString()}
                              </span>
                              <br />
                              {metric.is_verified ? (
                                <span className="badge success">Verified</span>
                              ) : (
                                <span className="badge">Pending</span>
                              )}
                              {!metric.is_verified && hasRole("coach", "coordinator", "admin") && (
                                <button
                                  type="button"
                                  className="ghost-button"
                                  disabled={verifying}
                                  onClick={() => handleVerifyMetric(metric.id)}
                                >
                                  {verifying ? "Verifying..." : "Verify"}
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <EmptyState
                        headline="No metrics tracked"
                        description="Log your latest velocities or pop times to build trust."
                      />
                    )}
                  </div>
                </div>
              </Panel>
            ),
          },
          {
            id: "training",
            label: "Training",
            helper: "Daily grind",
            icon: panelIcons.training,
            render: () => (
              <Panel
                id="training"
                title="Training Log"
                description="Document workouts and request verifications."
                active={activePanel === "training"}
                loading={isHydrating && !logs.length}
              >
                <div className="panel-grid">
                  <form onSubmit={handleLogSave}>
                    <h3>Log session</h3>
                    <label>
                      Activity
                      <select name="activity_type">
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
                    <button className="primary-button" disabled={submitting === "training"}>
                      {submitting === "training" ? "Saving..." : "Save log"}
                    </button>
                  </form>
                  <div>
                    <h3>Recent sessions</h3>
                    {logs.length ? (
                      <ul className="stack-list">
                        {logs.map((log) => {
                          const verifying = submitting === `verify-log-${log.id}`;
                          return (
                            <li key={log.id}>
                              <strong>
                                {log.activity_type} • {log.duration_minutes} min on {log.date}
                              </strong>
                              <br />
                              <span className="muted">{log.notes || "No notes"}</span>
                              <br />
                              {log.is_verified ? (
                                <span className="badge success">Verified</span>
                              ) : (
                                <span className="badge">Pending</span>
                              )}
                              {!log.is_verified && hasRole("coach", "coordinator", "admin") && (
                                <button
                                  type="button"
                                  className="ghost-button"
                                  disabled={verifying}
                                  onClick={() => handleVerifyLog(log.id)}
                                >
                                  {verifying ? "Verifying..." : "Verify"}
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <EmptyState
                        headline="No training logged"
                        description="Consistency wins. Log today’s session to stay accountable."
                      />
                    )}
                  </div>
                </div>
              </Panel>
            ),
          },
          {
            id: "achievements",
            label: "Achievements",
            helper: "Milestones & tokens",
            icon: panelIcons.achievements,
            render: () => (
              <Panel
                id="achievements"
                title="Achievements & Tokens"
                description="Celebrate milestones and stay on top of wallets."
                active={activePanel === "achievements"}
                loading={isHydrating && !achievements.length && !tokens.transactions.length}
              >
                <div className="panel-grid">
                  <div>
                    <h3>My achievements</h3>
                    {achievements.length ? (
                      <ul className="stack-list">
                        {achievements.map((item) => (
                          <li key={item.id}>
                            <strong>{item.achievement.name}</strong> (tokens: {item.achievement.token_reward})
                            <br />
                            <span className="muted">
                              Awarded {new Date(item.awarded_at).toLocaleDateString()}
                            </span>
                            <br />
                            {item.notes || "No notes"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyState
                        headline="No achievements yet"
                        description="Coaches can recognize stand-out performances here."
                      />
                    )}
                  </div>
                  <div>
                    <h3>Token wallet</h3>
                    <div className="token-balance">Balance: {tokens.balance ?? "—"}</div>
                    {tokens.transactions.length ? (
                      <ul className="stack-list">
                        {tokens.transactions.map((transaction) => (
                          <li key={transaction.id}>
                            <strong>
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount} tokens
                            </strong>
                            <br />
                            <span className="muted">{transaction.reason}</span>
                            <br />
                            <span className="muted">
                              {new Date(transaction.created_at).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyState
                        headline="No token activity"
                        description="Rewards and redemptions will appear once granted."
                      />
                    )}
                  </div>
                </div>
                {hasRole("coach", "coordinator", "admin") && (
                  <div className="panel-grid">
                    <form onSubmit={handleAwardAchievement}>
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
                      <button className="primary-button" disabled={submitting === "award"}>
                        {submitting === "award" ? "Awarding..." : "Award"}
                      </button>
                    </form>
                    <form onSubmit={handleGrantTokens}>
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
                      <button className="primary-button" disabled={submitting === "grant-tokens"}>
                        {submitting === "grant-tokens" ? "Granting..." : "Grant"}
                      </button>
                    </form>
                  </div>
                )}
              </Panel>
            ),
          },
        ]
      : [
          {
            id: "auth",
            label: "Authenticate",
            helper: "Create or sign in",
            icon: panelIcons.auth,
            render: () => (
              <Panel
                id="auth"
                title="Authentication"
                description="Register or sign in to unlock role-specific experiences."
                active={activePanel === "auth"}
                loading={false}
              >
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
                    <button className="primary-button" disabled={submitting === "register"}>
                      {submitting === "register" ? "Creating..." : "Sign up"}
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
                    <button className="primary-button" disabled={submitting === "login"}>
                      {submitting === "login" ? "Signing in..." : "Sign in"}
                    </button>
                  </form>
                </div>
              </Panel>
            ),
          },
        ];

    return basePanels;
  }, [
    authed,
    activePanel,
    achievements,
    divisions,
    handleApproveCoach,
    handleAwardAchievement,
    handleCreateTeam,
    handleGrantTokens,
    handleJoinTeam,
    handleLogin,
    handleMetricSave,
    handleProfileSave,
    handleRegister,
    handleLogSave,
    handleVerifyLog,
    handleVerifyMetric,
    hasRole,
    isHydrating,
    logs,
    metrics,
    profile,
    profileDraft,
    submitting,
    teams,
    tokens,
  ]);

  const panelNavItems = panels.map((panel) => ({
    id: panel.id,
    label: panel.label,
    helper: panel.helper,
    icon: panel.icon,
  }));

  const changePanel = (panelId) => {
    setActivePanel(panelId);
  };

  return (
    <>
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
              value={apiBase}
              onChange={(event) => setApiBase(event.target.value)}
              placeholder="https://example.com"
            />
          </label>
        </div>
      </header>

      <main className="app-layout">
        <aside className="sidebar" aria-label="Quick stats">
          <ProfileSnapshot user={user} profile={profile} onLogout={resetAuth} authed={authed} />
          <RoleAccessCard role={user?.role} capabilities={capabilities} />
          <QuickChecksCard />
        </aside>

        <section className="workspace" aria-live="polite">
          <div id="notification">
            <Toast toast={toast} onDismiss={() => setToast(null)} />
          </div>
          <WorkspaceNav panels={panelNavItems} activePanel={activePanel} onSelect={changePanel} />
          {panels.map((panel) => (
            <React.Fragment key={panel.id}>{panel.render()}</React.Fragment>
          ))}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Built for the Vancouver Baseball Connect MVP — Django backend at <code>/api/</code>,
          frontend served as static assets. Contributions welcome via AGENTS guidelines.
        </p>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
