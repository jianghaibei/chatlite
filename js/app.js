// ChatLite main logic: sessions, streaming chat, masks, slash prompts, export.
// All state lives in localStorage. No server, no tracking.
(function () {
  const $ = (id) => document.getElementById(id);
  const store = {
    get(k, d) { try { const v = localStorage.getItem("chatlite:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { localStorage.setItem("chatlite:" + k, JSON.stringify(v)); }
  };
  let settings = store.get("settings", { apiKey: "", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" });
  let sessions = store.get("sessions", []);
  let currentId = store.get("currentId", null);

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function current() { return sessions.find((s) => s.id === currentId) || null; }
  function save() { store.set("sessions", sessions); store.set("currentId", currentId); store.set("settings", settings); }

  function newSession(mask) {
    const s = { id: uid(), title: mask ? mask.emoji + " " + mask.name : "新对话", system: mask ? mask.system : "You are a helpful assistant.", messages: [] };
    sessions.unshift(s); currentId = s.id; save(); render();
    if (mask) addLocal("assistant", "你好，我是「" + mask.name + "」。" + mask.desc + "，直接把你的需求发给我就行。");
  }

  function addLocal(role, content) {
    const s = current(); if (!s) return;
    s.messages.push({ role, content }); save(); renderMessages();
  }

  function render() { renderSessions(); renderMasks(); renderMessages(); renderTitle(); }
  function renderTitle() { const s = current(); $("chatTitle").textContent = s ? s.title : "新对话"; }

  function renderSessions() {
    const box = $("sessionList"); box.innerHTML = "";
    sessions.forEach((s) => {
      const row = document.createElement("div");
      row.className = "session" + (s.id === currentId ? " active" : "");
      const name = document.createElement("span"); name.textContent = s.title; name.className = "s-name";
      name.onclick = () => { currentId = s.id; save(); render(); };
      const del = document.createElement("button"); del.textContent = "×"; del.className = "s-del";
      del.onclick = () => { sessions = sessions.filter((x) => x.id !== s.id); if (currentId === s.id) currentId = sessions.length ? sessions[0].id : null; save(); render(); };
      row.appendChild(name); row.appendChild(del); box.appendChild(row);
    });
  }

  function renderMasks() {
    const box = $("maskList"); box.innerHTML = "";
    MASKS.forEach((m) => {
      const b = document.createElement("button"); b.className = "mask";
      b.textContent = m.emoji + " " + m.name;
      b.title = m.desc; b.onclick = () => newSession(m);
      box.appendChild(b);
    });
  }

  function esc(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function renderMessages() {
    const box = $("messages"); box.innerHTML = "";
    const s = current(); if (!s) { box.innerHTML = "<div class='empty'>点左侧「＋ 新对话」开始，或选一个面具助手。</div>"; return; }
    s.messages.forEach((m) => {
      const d = document.createElement("div");
      d.className = "msg " + m.role;
      d.innerHTML = "<div class='role'>" + (m.role === "user" ? "我" : "AI") + "</div><div class='bubble'>" + esc(m.content) + "</div>";
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;
  }

  function demoReply(userText, s) {
    const who = s && s.title ? s.title : "ChatLite";
    return "【演示模式】我是「" + who + "」，已收到你的消息：“" + userText.slice(0, 60) + "”。\n\n现在还没有填 API Key，所以这是演示回复。到右上角「设置」填入你的 OpenAI API Key 并保存，我就会用你选的模型（当前：" + settings.model + "）真实回复，流式逐字输出。";
  }

  async function send() {
    const input = $("input"); const text = input.value.trim(); if (!text) return;
    if (!current()) newSession(null);
    const s = current();
    input.value = ""; hideSlash();
    s.messages.push({ role: "user", content: text });
    if (s.title === "新对话") s.title = text.slice(0, 18);
    save(); render();
    s.messages.push({ role: "assistant", content: "" });
    renderMessages();
    const bubbleHolder = s.messages[s.messages.length - 1];

    if (!settings.apiKey) {
      bubbleHolder.content = demoReply(text, s); save(); renderMessages(); renderSessions(); return;
    }
    try {
      const resp = await fetch(settings.baseUrl.replace(/\/$/, "") + "/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + settings.apiKey },
        body: JSON.stringify({ model: settings.model, stream: true, messages: [{ role: "system", content: s.system }].concat(s.messages.slice(0, -1)) })
      });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const reader = resp.body.getReader(); const dec = new TextDecoder(); let buf = "";
      while (true) {
        const r = await reader.read(); if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const line of lines) {
          const t = line.trim(); if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim(); if (data === "[DONE]") continue;
          try { const j = JSON.parse(data); const delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (delta) { bubbleHolder.content += delta; renderMessages(); } } catch (e) {}
        }
      }
    } catch (e) {
      bubbleHolder.content = "⚠️ 请求失败：" + e.message + "。请检查设置里的 API Key、Base URL 和网络。";
    }
    save(); renderMessages(); renderSessions();
  }

  // Slash prompts
  function hideSlash() { $("slashMenu").classList.add("hidden"); }
  function onInput() {
    const v = $("input").value;
    if (!v.startsWith("/")) { hideSlash(); return; }
    const hits = PROMPTS.filter((p) => p.cmd.startsWith(v.split("\n")[0]) || v === "/");
    const menu = $("slashMenu"); if (!hits.length) { hideSlash(); return; }
    menu.innerHTML = ""; menu.classList.remove("hidden");
    hits.forEach((p) => {
      const d = document.createElement("div"); d.className = "slash-item"; d.textContent = p.cmd + " — " + p.text.slice(0, 24) + "…";
      d.onclick = () => { $("input").value = p.text; $("input").focus(); hideSlash(); };
      menu.appendChild(d);
    });
  }

  function exportMd() {
    const s = current(); if (!s) return;
    let md = "# " + s.title + "\n\n";
    s.messages.forEach((m) => { md += (m.role === "user" ? "**我：** " : "**AI：** ") + m.content + "\n\n"; });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = "chatlite-" + s.title.replace(/\s+/g, "-").slice(0, 30) + ".md"; a.click();
    URL.revokeObjectURL(a.href);
  }

  // Wire up
  $("newChat").onclick = () => newSession(null);
  $("sendBtn").onclick = send;
  $("exportBtn").onclick = exportMd;
  $("input").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  $("input").addEventListener("input", onInput);
  $("themeBtn").onclick = () => { document.body.classList.toggle("light"); store.set("light", document.body.classList.contains("light")); };
  if (store.get("light", false)) document.body.classList.add("light");
  $("settingsBtn").onclick = () => { $("apiKey").value = settings.apiKey; $("baseUrl").value = settings.baseUrl; $("model").value = settings.model; $("settingsModal").classList.remove("hidden"); };
  $("closeSettings").onclick = () => $("settingsModal").classList.add("hidden");
  $("saveSettings").onclick = () => { settings = { apiKey: $("apiKey").value.trim(), baseUrl: $("baseUrl").value.trim() || "https://api.openai.com/v1", model: $("model").value }; save(); $("settingsModal").classList.add("hidden"); };

  if (!sessions.length) newSession(null); else render();
})();
