"use strict";
(() => {
  // src/chatbot/utils.js
  function luminance(hex) {
    const c = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => {
      const v = parseInt(c.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function readableTextColor(bgHex) {
    return luminance(bgHex) > 0.35 ? "#1a1a2e" : "#ffffff";
  }
  function ensureVisible(hex) {
    return luminance(hex) > 0.85 ? "#e8e8ee" : hex;
  }
  function parseMarkdown(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/^### (.+)$/gm, "<h4 style='margin:10px 0 4px;font-size:13px;font-weight:700;'>$1</h4>").replace(/^## (.+)$/gm, "<h3 style='margin:10px 0 4px;font-size:14px;font-weight:700;'>$1</h3>").replace(/^# (.+)$/gm, "<h2 style='margin:10px 0 4px;font-size:15px;font-weight:700;'>$1</h2>").replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, "<code style='background:rgba(0,0,0,0.12);padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace;'>$1</code>").replace(/^[\-\*] (.+)$/gm, "<li style='margin:3px 0 3px 16px;list-style:disc;'>$1</li>").replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul style='margin:6px 0;padding:0;'>${m}</ul>`).replace(/^\d+\. (.+)$/gm, "<li style='margin:3px 0 3px 16px;list-style:decimal;'>$1</li>").replace(/^---$/gm, "<hr style='border:none;border-top:1px solid rgba(0,0,0,0.1);margin:8px 0;'/>").replace(/\n{2,}/g, "<br/><br/>").replace(/\n/g, "<br/>");
  }
  function addMessage(messages, text, from, primaryColor, secondaryColor) {
    const isUser = from === "user";
    const bgColor = ensureVisible(isUser ? primaryColor : secondaryColor);
    const txColor = readableTextColor(bgColor);
    const bubble = document.createElement("div");
    bubble.innerHTML = isUser ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : parseMarkdown(text);
    Object.assign(bubble.style, {
      maxWidth: "82%",
      padding: "9px 13px",
      borderRadius: "16px",
      fontSize: "13px",
      lineHeight: "1.5",
      alignSelf: isUser ? "flex-end" : "flex-start",
      background: bgColor,
      color: txColor,
      border: "1px solid rgba(0,0,0,0.15)",
      boxShadow: `0 2px 8px ${bgColor}40`,
      borderBottomRightRadius: isUser ? "4px" : "16px",
      borderBottomLeftRadius: isUser ? "16px" : "4px",
      animation: "nexa-fade-in 0.2s ease-out",
      wordBreak: "break-word"
    });
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }
  function addTypingIndicator(messages, secondaryColor) {
    const bgColor = ensureVisible(secondaryColor);
    const dotColor = readableTextColor(bgColor);
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "10px 13px",
      background: bgColor,
      borderRadius: "16px",
      borderBottomLeftRadius: "4px",
      alignSelf: "flex-start",
      border: "1px solid rgba(0,0,0,0.15)",
      boxShadow: `0 2px 8px ${bgColor}40`,
      animation: "nexa-fade-in 0.2s ease-out"
    });
    [0, 150, 300].forEach((delay) => {
      const dot = document.createElement("span");
      Object.assign(dot.style, {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: dotColor,
        opacity: "0.7",
        display: "inline-block",
        animation: "nexa-bounce 1.2s ease-in-out infinite",
        animationDelay: `${delay}ms`
      });
      wrap.appendChild(dot);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }
  function injectStyles(primaryColor, secondaryColor) {
    const style = document.createElement("style");
    style.textContent = `
        @keyframes nexa-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes nexa-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
        }
        @keyframes nexa-slide-up {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nexa-fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        #nexa-messages::-webkit-scrollbar { width: 4px; }
        #nexa-messages::-webkit-scrollbar-track { background: transparent; }
        #nexa-messages::-webkit-scrollbar-thumb { background: ${secondaryColor}60; border-radius: 99px; }
        #nexa-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 3px ${primaryColor}26; }
        #nexa-send:hover { opacity: 0.85; }
        #nexa-btn:hover  { opacity: 0.85; transform: scale(1.08); }
    `;
    document.head.appendChild(style);
  }

  // src/chatbot/ui.js
  function createButton(settings) {
    const { primaryColor, widgetPosition } = settings;
    const side = widgetPosition === "bottom-left" ? "left" : "right";
    const txtColor = readableTextColor(primaryColor);
    const btn = document.createElement("button");
    btn.id = "nexa-btn";
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${txtColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "24px",
      [side]: "24px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: primaryColor,
      color: txtColor,
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: `0 8px 32px ${primaryColor}70`,
      zIndex: "999999",
      transition: "opacity 0.2s, transform 0.2s"
    });
    return btn;
  }
  function createBox(settings) {
    const { primaryColor, secondaryColor, widgetPosition, chatbotName, logo } = settings;
    const side = widgetPosition === "bottom-left" ? "left" : "right";
    const headerTxt = readableTextColor(primaryColor);
    const logoBgColor = secondaryColor;
    const logoTxt = readableTextColor(logoBgColor);
    const isSvg = typeof logo === "string" && logo.trimStart().startsWith("<");
    const logoHtml = isSvg ? `<span style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:${logoTxt};">${logo}</span>` : `<span style="font-size:18px;line-height:1;">${logo || "\u{1F4AC}"}</span>`;
    const box = document.createElement("div");
    box.id = "nexa-box";
    Object.assign(box.style, {
      position: "fixed",
      bottom: "92px",
      [side]: "24px",
      width: "340px",
      height: "480px",
      background: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
      border: `1px solid ${primaryColor}30`,
      display: "none",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: "999999",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      transformOrigin: `bottom ${side}`
    });
    box.innerHTML = `
        <!-- Header -->
        <div style="
            background: ${primaryColor};
            padding: 14px 16px; display: flex; align-items: center;
            justify-content: space-between; flex-shrink: 0;
        ">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="
                    width:36px; height:36px; border-radius:50%;
                    background:${logoBgColor};
                    display:flex; align-items:center; justify-content:center;
                ">${logoHtml}</div>
                <div>
                    <div style="color:${headerTxt}; font-size:14px; font-weight:600; line-height:1.2;">${chatbotName || "Support"}</div>
                    <div style="display:flex; align-items:center; gap:5px; margin-top:2px;">
                        <span style="
                            width:7px; height:7px; border-radius:50%; background:#4ade80;
                            display:inline-block; animation:nexa-pulse 2s ease-in-out infinite;
                        "></span>
                        <span style="color:${headerTxt}; opacity:0.85; font-size:11px; font-weight:500;">Online</span>
                    </div>
                </div>
            </div>
            <button id="nexa-close" style="
                background:rgba(0,0,0,0.15); border:none; color:${headerTxt};
                width:28px; height:28px; border-radius:50%; cursor:pointer;
                font-size:14px; display:flex; align-items:center; justify-content:center;
                transition:background 0.15s;
            " onmouseover="this.style.background='rgba(0,0,0,0.25)'"
               onmouseout="this.style.background='rgba(0,0,0,0.15)'">\u2715</button>
        </div>

        <!-- Messages -->
        <div id="nexa-messages" style="
            flex:1; padding:14px 12px; overflow-y:auto; background:#ffffff;
            display:flex; flex-direction:column; gap:8px;
        "></div>

        <!-- Input -->
        <div style="
            display:flex; align-items:center; gap:8px; padding:10px 12px;
            border-top:1px solid ${primaryColor}20; background:#fff; flex-shrink:0;
        ">
            <input id="nexa-input" type="text" placeholder="Type a message\u2026" style="
                flex:1; padding:9px 13px; border:1.5px solid ${primaryColor}30;
                border-radius:12px; font-size:13px; font-family:inherit;
                background:#f9f9f9; color:#1a1a2e;
                transition:border-color 0.2s, box-shadow 0.2s;
            "/>
            <button id="nexa-send" style="
                width:36px; height:36px; border-radius:10px; background:${primaryColor};
                border:none; cursor:pointer;
                display:flex; align-items:center; justify-content:center;
                flex-shrink:0; transition:opacity 0.2s;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${readableTextColor(primaryColor)}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        </div>
    `;
    return box;
  }

  // src/chatbot/index.js
  var scriptTag = document.currentScript;
  var baseUrl = new URL("/", scriptTag.src).href.replace(/\/$/, "");
  var ownerId = scriptTag.getAttribute("data-owner-id");
  (async function() {
    if (!ownerId) {
      console.warn("[NexaSupport] data-owner-id is missing.");
      return;
    }
    let settings;
    try {
      const res = await fetch(`${baseUrl}/api/settings/get?ownerId=${ownerId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      settings = await res.json();
    } catch (err) {
      console.warn("[NexaSupport] Failed to load settings.", err);
      return;
    }
    if (settings?.isActive === false) return;
    const s = {
      chatbotName: settings?.chatbotName || "Support",
      logo: settings?.logo || "\u{1F4AC}",
      primaryColor: settings?.primaryColor || "#6366f1",
      secondaryColor: settings?.secondaryColor || "#4f46e5",
      widgetPosition: settings?.widgetPosition || "bottom-right",
      greetingMessage: settings?.greetingMessage || "\u{1F44B} Hi! How can I help you today?"
    };
    injectStyles(s.primaryColor, s.secondaryColor);
    const btn = createButton(s);
    const box = createBox(s);
    document.body.appendChild(btn);
    document.body.appendChild(box);
    const messages = box.querySelector("#nexa-messages");
    const input = box.querySelector("#nexa-input");
    const sendBtn = box.querySelector("#nexa-send");
    const closeBtn = box.querySelector("#nexa-close");
    const CHAT_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    const CLOSE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    let isOpen = false;
    function openBox() {
      box.style.display = "flex";
      box.style.animation = "nexa-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards";
      btn.innerHTML = CLOSE_SVG;
      isOpen = true;
      setTimeout(() => input.focus(), 260);
    }
    function closeBox() {
      box.style.animation = "none";
      box.style.display = "none";
      btn.innerHTML = CHAT_SVG;
      isOpen = false;
    }
    btn.addEventListener("click", () => isOpen ? closeBox() : openBox());
    closeBtn.addEventListener("click", closeBox);
    let greeted = false;
    btn.addEventListener("click", () => {
      if (!greeted && isOpen) {
        greeted = true;
        setTimeout(() => addMessage(messages, s.greetingMessage, "ai", s.primaryColor, s.secondaryColor), 300);
      }
    });
    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addMessage(messages, text, "user", s.primaryColor, s.secondaryColor);
      input.value = "";
      sendBtn.disabled = true;
      const typing = addTypingIndicator(messages, s.secondaryColor);
      try {
        const res = await fetch(`${baseUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, ownerId })
        });
        messages.removeChild(typing);
        const bubble = addMessage(messages, "", "ai", s.primaryColor, s.secondaryColor);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          bubble.innerHTML = parseMarkdown(raw);
          messages.scrollTop = messages.scrollHeight;
        }
        if (!raw) bubble.innerHTML = "Sorry, something went wrong.";
      } catch {
        messages.removeChild(typing);
        addMessage(messages, "Sorry, something went wrong.", "ai", s.primaryColor, s.secondaryColor);
      } finally {
        sendBtn.disabled = false;
      }
    }
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  })();
})();
