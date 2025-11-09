const storageKeys = {
  apiBase: "vbconnect:apiBase",
  token: "vbconnect:token",
  user: "vbconnect:user",
};

const state = {
  apiBase: localStorage.getItem(storageKeys.apiBase) || "http://localhost:8000",
  token: localStorage.getItem(storageKeys.token),
  user: JSON.parse(localStorage.getItem(storageKeys.user) || "null"),
  profile: null,
  teams: [],
  divisions: [],
  metrics: [],
  logs: [],
  achievements: [],
  tokens: { balance: 0, transactions: [] },
};

const refs = {
  apiBaseInput: document.getElementById("api-base"),
  logoutBtn: document.getElementById("logout-btn"),
  notification: document.getElementById("notification"),
  authPanel: document.getElementById("auth-panel"),
  profilePanel: document.getElementById("profile-panel"),
  teamsPanel: document.getElementById("teams-panel"),
  metricsPanel: document.getElementById("metrics-panel"),
  trainingPanel: document.getElementById("training-panel"),
  achievementPanel: document.getElementById("achievement-panel"),
  userCard: document.getElementById("user-card"),
  roleCardList: document.getElementById("role-capabilities"),
  divisionSelect: document.getElementById("division-select"),
  divisionList: document.getElementById("division-list"),
  teamList: document.getElementById("team-list"),
  metricList: document.getElementById("metric-list"),
  logList: document.getElementById("log-list"),
  achievementList: document.getElementById("achievement-list"),
  tokenList: document.getElementById("token-list"),
  tokenBalance: document.getElementById("token-balance"),
  registerForm: document.getElementById("register-form"),
  loginForm: document.getElementById("login-form"),
  profileForm: document.getElementById("profile-form"),
  createTeamForm: document.getElementById("create-team-form"),
  joinTeamForm: document.getElementById("join-team-form"),
  approveCoachForm: document.getElementById("approve-coach-form"),
  metricForm: document.getElementById("metric-form"),
  logForm: document.getElementById("log-form"),
  awardAchievementForm: document.getElementById("award-achievement-form"),
  grantTokenForm: document.getElementById("grant-token-form"),
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

const panels = [
  refs.profilePanel,
  refs.teamsPanel,
  refs.metricsPanel,
  refs.trainingPanel,
  refs.achievementPanel,
];

refs.apiBaseInput.value = state.apiBase;

refs.apiBaseInput.addEventListener("change", () => {
  state.apiBase = refs.apiBaseInput.value.trim().replace(/\/$/, "");
  localStorage.setItem(storageKeys.apiBase, state.apiBase);
  pushToast(`API base set to ${state.apiBase}`, "success");
});

refs.logoutBtn.addEventListener("click", () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.user);
  updateAuthVisibility();
  pushToast("Signed out", "success");
});

const formToJSON = (form) => Object.fromEntries(new FormData(form).entries());

async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  if (!state.apiBase) throw new Error("API base URL not configured.");
  const opts = { method, headers: { ...headers } };
  if (state.token) {
    opts.headers.Authorization = `Token ${state.token}`;
  }
  if (body && !(body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else if (body) {
    opts.body = body;
  }
  const res = await fetch(`${state.apiBase}${path}`, opts).catch((err) => {
    throw new Error(`Network error: ${err.message}`);
  });
  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function pushToast(message, type = "success") {
  refs.notification.innerHTML = `
    <div class="toast ${type}">
      <span>${message}</span>
      <button aria-label="Dismiss">&times;</button>
    </div>`;
  const dismissBtn = refs.notification.querySelector("button");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => (refs.notification.innerHTML = ""));
  }
  setTimeout(() => {
    if (refs.notification.contains(dismissBtn?.parentElement)) {
      refs.notification.innerHTML = "";
    }
  }, 6000);
}

function hasRole(...roles) {
  return roles.includes(state.user?.role);
}

function updateAuthVisibility() {
  const authed = Boolean(state.token && state.user);
  refs.authPanel.hidden = authed;
  panels.forEach((panel) => (panel.hidden = !authed));
  refs.logoutBtn.style.visibility = authed ? "visible" : "hidden";
  if (!authed) {
    refs.userCard.innerHTML = `
      <h2>Profile Snapshot</h2>
      <p class="muted">Sign in to load details.</p>
    `;
    refs.roleCardList.innerHTML = "";
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  try {
    const data = await apiRequest("/api/auth/register/", {
      method: "POST",
      body: payload,
    });
    state.token = data.token;
    state.user = data.user;
    persistAuth();
    pushToast("Welcome aboard! Account created.", "success");
    await hydrate();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  try {
    const data = await apiRequest("/api/auth/login/", {
      method: "POST",
      body: payload,
    });
    state.token = data.token;
    state.user = data.user;
    persistAuth();
    pushToast(`Welcome back ${state.user.first_name || ""}`.trim(), "success");
    await hydrate();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleProfileSave(event) {
  event.preventDefault();
  if (!state.profile) return;
  const payload = formToJSON(event.target);
  payload.public_profile = event.target.public_profile.checked;
  ["height_cm", "weight_kg", "graduation_year"].forEach((field) => {
    if (payload[field] === "") payload[field] = null;
  });
  try {
    state.profile = await apiRequest("/api/profile/", {
      method: "PUT",
      body: payload,
    });
    renderProfile();
    pushToast("Profile updated", "success");
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleCreateTeam(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  payload.season_year = Number(payload.season_year);
  try {
    await apiRequest("/api/teams/", { method: "POST", body: payload });
    pushToast("Team created", "success");
    event.target.reset();
    await Promise.all([fetchTeams(), fetchProfile()]);
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleJoinTeam(event) {
  event.preventDefault();
  const { team_id } = formToJSON(event.target);
  try {
    await apiRequest(`/api/teams/${team_id}/join/`, { method: "POST" });
    pushToast("Join request submitted", "success");
    event.target.reset();
    await fetchTeams();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleApproveCoach(event) {
  event.preventDefault();
  const { team_id, coach_id } = formToJSON(event.target);
  try {
    await apiRequest(`/api/teams/${team_id}/approve-coach/`, {
      method: "POST",
      body: { coach_id },
    });
    pushToast("Coach approved", "success");
    event.target.reset();
    await fetchTeams();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleMetricSave(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  payload.value = Number(payload.value);
  try {
    await apiRequest("/api/metrics/", { method: "POST", body: payload });
    pushToast("Metric saved", "success");
    await fetchMetrics();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleLogSave(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  payload.duration_minutes = Number(payload.duration_minutes);
  try {
    await apiRequest("/api/training/", { method: "POST", body: payload });
    pushToast("Training log saved", "success");
    event.target.reset();
    await fetchLogs();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleAwardAchievement(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  try {
    await apiRequest("/api/achievements/award/", { method: "POST", body: payload });
    pushToast("Achievement awarded", "success");
    await fetchAchievements();
    await fetchTokens();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function handleGrantTokens(event) {
  event.preventDefault();
  const payload = formToJSON(event.target);
  payload.amount = Number(payload.amount);
  try {
    await apiRequest("/api/tokens/", { method: "POST", body: payload });
    pushToast("Tokens granted", "success");
    event.target.reset();
    await fetchTokens();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function verifyMetric(id) {
  try {
    await apiRequest(`/api/metrics/${id}/verify/`, { method: "POST" });
    pushToast("Metric verified", "success");
    await fetchMetrics();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

async function verifyTrainingLog(id) {
  try {
    await apiRequest(`/api/training/${id}/verify/`, { method: "POST" });
    pushToast("Log verified", "success");
    await fetchLogs();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

function persistAuth() {
  localStorage.setItem(storageKeys.token, state.token);
  localStorage.setItem(storageKeys.user, JSON.stringify(state.user));
}

async function fetchCurrentUser() {
  state.user = await apiRequest("/api/auth/me/");
  persistAuth();
}

async function fetchProfile() {
  state.profile = await apiRequest("/api/profile/");
  renderProfile();
}

async function fetchDivisions() {
  state.divisions = await apiRequest("/api/divisions/");
  renderDivisions();
}

async function fetchTeams() {
  state.teams = await apiRequest("/api/teams/");
  renderTeams();
}

async function fetchMetrics() {
  state.metrics = await apiRequest("/api/metrics/");
  renderMetrics();
}

async function fetchLogs() {
  state.logs = await apiRequest("/api/training/");
  renderLogs();
}

async function fetchAchievements() {
  state.achievements = await apiRequest("/api/achievements/");
  renderAchievements();
}

async function fetchTokens() {
  state.tokens = await apiRequest("/api/tokens/");
  renderTokens();
}

async function hydrate() {
  updateAuthVisibility();
  if (!state.token) return;
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
    updateRoleCard();
  } catch (err) {
    pushToast(err.message, "error");
  }
}

function renderProfile() {
  if (!state.profile || !state.user) return;
  const { user } = state;
  refs.userCard.innerHTML = `
    <h2>${user.first_name || "Player"} ${user.last_name || ""}</h2>
    <p>${user.email}</p>
    <p class="badge">${user.role}</p>
    <p class="muted">${user.bio || "No bio yet."}</p>
  `;
  refs.profileForm.position.value = state.profile.position || "";
  refs.profileForm.bats.value = state.profile.bats || "";
  refs.profileForm.throws.value = state.profile.throws || "";
  refs.profileForm.height_cm.value = state.profile.height_cm || "";
  refs.profileForm.weight_kg.value = state.profile.weight_kg || "";
  refs.profileForm.graduation_year.value = state.profile.graduation_year || "";
  refs.profileForm.school.value = state.profile.school || "";
  refs.profileForm.avatar_url.value = state.profile.avatar_url || "";
  refs.profileForm.public_profile.checked = Boolean(state.profile.public_profile);
}

function renderDivisions() {
  refs.divisionSelect.innerHTML = state.divisions
    .map((division) => `<option value="${division.id}">${division.name}</option>`)
    .join("");
  refs.divisionList.innerHTML = state.divisions
    .map(
      (division) =>
        `<li><strong>${division.name}</strong><br /><span class="muted">${
          division.league_type
        }</span></li>`
    )
    .join("");
}

function renderTeams() {
  refs.teamList.innerHTML = state.teams
    .map(
      (team) => `
      <li>
        <strong>${team.name}</strong> • ${team.season_year}<br/>
        <span class="muted">${team.division_detail?.name || "Division"}</span><br/>
        <span class="badge">${team.roster_count} players</span>
      </li>`
    )
    .join("");
}

function renderMetrics() {
  refs.metricList.innerHTML = state.metrics
    .map((metric) => {
      const isVerified = metric.is_verified;
      const verifyBtn =
        hasRole("coach", "coordinator", "admin") && !isVerified
          ? `<button type="button" data-action="verify-metric" data-id="${metric.id}" class="ghost-button">Verify</button>`
          : "";
      return `
        <li>
          <strong>${metric.metric_type.replace(/_/g, " ")}</strong> — ${
        metric.value
      } ${metric.unit || ""}
          <br/><span class="muted">Updated ${new Date(metric.created_at).toLocaleDateString()}</span>
          <br/>${isVerified ? '<span class="badge success">Verified</span>' : '<span class="badge">Pending</span>'}
          ${verifyBtn}
        </li>`;
    })
    .join("");
  refs.metricList.querySelectorAll("[data-action='verify-metric']").forEach((btn) => {
    btn.addEventListener("click", () => verifyMetric(btn.dataset.id));
  });
}

function renderLogs() {
  refs.logList.innerHTML = state.logs
    .map((log) => {
      const verifyBtn =
        hasRole("coach", "coordinator", "admin") && !log.is_verified
          ? `<button type="button" class="ghost-button" data-action="verify-log" data-id="${log.id}">Verify</button>`
          : "";
      return `
        <li>
          <strong>${log.activity_type}</strong> • ${log.duration_minutes} min on ${log.date}
          <br/><span class="muted">${log.notes || "No notes"}</span><br/>
          ${log.is_verified ? '<span class="badge success">Verified</span>' : '<span class="badge">Pending</span>'}
          ${verifyBtn}
        </li>
      `;
    })
    .join("");
  refs.logList.querySelectorAll("[data-action='verify-log']").forEach((btn) => {
    btn.addEventListener("click", () => verifyTrainingLog(btn.dataset.id));
  });
}

function renderAchievements() {
  refs.achievementList.innerHTML = state.achievements
    .map(
      (item) => `
      <li>
        <strong>${item.achievement.name}</strong> (tokens: ${item.achievement.token_reward})
        <br/><span class="muted">Awarded ${new Date(item.awarded_at).toLocaleDateString()}</span>
        <br/>${item.notes || ""}
      </li>
    `
    )
    .join("");
}

function renderTokens() {
  refs.tokenBalance.textContent = `Balance: ${state.tokens.balance}`;
  refs.tokenList.innerHTML = state.tokens.transactions
    .map(
      (tx) => `
      <li>
        <strong>${tx.amount > 0 ? "+" : ""}${tx.amount} tokens</strong>
        <br/><span class="muted">${tx.reason}</span>
        <br/><span class="muted">${new Date(tx.created_at).toLocaleString()}</span>
      </li>`
    )
    .join("");
}

function updateRoleCard() {
  const role = state.user?.role;
  if (!role) {
    refs.roleCardList.innerHTML = "";
    return;
  }
  const capabilities = ROLE_CAPABILITIES[role] || [];
  refs.roleCardList.innerHTML = capabilities.map((cap) => `<li>${cap}</li>`).join("");
  refs.roleCardList.insertAdjacentHTML(
    "afterbegin",
    `<li><strong>Current role:</strong> ${role.toUpperCase()}</li>`
  );
  refs.createTeamForm.hidden = !hasRole("coach", "coordinator", "admin");
  refs.approveCoachForm.hidden = !hasRole("coordinator", "admin");
  refs.joinTeamForm.hidden = !hasRole("player", "parent");
  refs.awardAchievementForm.hidden = !hasRole("coach", "coordinator", "admin");
  refs.grantTokenForm.hidden = !hasRole("coach", "coordinator", "admin");
}

function attachHandlers() {
  refs.registerForm.addEventListener("submit", handleRegister);
  refs.loginForm.addEventListener("submit", handleLogin);
  refs.profileForm.addEventListener("submit", handleProfileSave);
  refs.createTeamForm.addEventListener("submit", handleCreateTeam);
  refs.joinTeamForm.addEventListener("submit", handleJoinTeam);
  refs.approveCoachForm.addEventListener("submit", handleApproveCoach);
  refs.metricForm.addEventListener("submit", handleMetricSave);
  refs.logForm.addEventListener("submit", handleLogSave);
  refs.awardAchievementForm.addEventListener("submit", handleAwardAchievement);
  refs.grantTokenForm.addEventListener("submit", handleGrantTokens);
}

attachHandlers();
updateAuthVisibility();

if (state.token && state.user) {
  hydrate();
}

