(function () {

    const scriptTag = document.currentScript;
    const apiUrl = new URL("/api/chat", scriptTag.src).href;
    const ownerId = scriptTag.getAttribute("data-owner-id");

    if (!ownerId) {
        console.warn("[NexaSupport] data-owner-id is missing.");
        return;
    }

    /* ── Inject keyframe animations ── */
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
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes nexa-fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0);   }
        }
        #nexa-box::-webkit-scrollbar { width: 0; }
        #nexa-messages::-webkit-scrollbar { width: 4px; }
        #nexa-messages::-webkit-scrollbar-track { background: transparent; }
        #nexa-messages::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 99px; }
        #nexa-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        #nexa-send:hover  { background: #4f46e5; }
        #nexa-btn:hover   { background: #4f46e5; transform: scale(1.08); }
    `;
    document.head.appendChild(style);

    /* ── Floating trigger button ── */
    const btn = document.createElement("button");
    btn.id = "nexa-btn";
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    Object.assign(btn.style, {
        position:     "fixed",
        bottom:       "24px",
        right:        "24px",
        width:        "56px",
        height:       "56px",
        borderRadius: "50%",
        background:   "#6366f1",
        color:        "#fff",
        border:       "none",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        cursor:       "pointer",
        boxShadow:    "0 8px 32px rgba(99,102,241,0.45)",
        zIndex:       "999999",
        transition:   "background 0.2s, transform 0.2s",
    });
    document.body.appendChild(btn);

    /* ── Chat box ── */
    const box = document.createElement("div");
    box.id = "nexa-box";
    Object.assign(box.style, {
        position:      "fixed",
        bottom:        "92px",
        right:         "24px",
        width:         "340px",
        height:        "480px",
        background:    "#fff",
        borderRadius:  "20px",
        boxShadow:     "0 24px 64px rgba(99,102,241,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        border:        "1px solid #e0e7ff",
        display:       "none",
        flexDirection: "column",
        overflow:      "hidden",
        zIndex:        "999999",
        fontFamily:    "Inter, system-ui, -apple-system, sans-serif",
        transformOrigin: "bottom right",
    });

    box.innerHTML = `
        <!-- Header -->
        <div style="
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        ">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 16px;
                ">💬</div>
                <div>
                    <div style="color:#fff; font-size:14px; font-weight:600; line-height:1.2;">NexaSupport</div>
                    <div style="display:flex; align-items:center; gap:5px; margin-top:2px;">
                        <span id="nexa-status-dot" style="
                            width: 7px; height: 7px;
                            border-radius: 50%;
                            background: #4ade80;
                            display: inline-block;
                            animation: nexa-pulse 2s ease-in-out infinite;
                        "></span>
                        <span style="color: rgba(255,255,255,0.85); font-size:11px; font-weight:500;">Online</span>
                    </div>
                </div>
            </div>
            <button id="nexa-close" style="
                background: rgba(255,255,255,0.15);
                border: none;
                color: #fff;
                width: 28px; height: 28px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 14px;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            " onmouseover="this.style.background='rgba(255,255,255,0.25)'"
               onmouseout="this.style.background='rgba(255,255,255,0.15)'">✕</button>
        </div>

        <!-- Messages -->
        <div id="nexa-messages" style="
            flex: 1;
            padding: 14px 12px;
            overflow-y: auto;
            background: #f8f9ff;
            display: flex;
            flex-direction: column;
            gap: 8px;
        "></div>

        <!-- Input bar -->
        <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            border-top: 1px solid #e0e7ff;
            background: #fff;
            flex-shrink: 0;
        ">
            <input id="nexa-input" type="text" placeholder="Type a message…" style="
                flex: 1;
                padding: 9px 13px;
                border: 1.5px solid #e0e7ff;
                border-radius: 12px;
                font-size: 13px;
                font-family: inherit;
                background: #f8f9ff;
                color: #1e1b4b;
                transition: border-color 0.2s, box-shadow 0.2s;
            "/>
            <button id="nexa-send" style="
                width: 36px; height: 36px;
                border-radius: 10px;
                background: #6366f1;
                border: none;
                color: #fff;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
                transition: background 0.2s;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        </div>
    `;
    document.body.appendChild(box);

    const messages   = box.querySelector("#nexa-messages");
    const input      = box.querySelector("#nexa-input");
    const sendBtn    = box.querySelector("#nexa-send");
    const closeBtn   = box.querySelector("#nexa-close");

    /* ── Helpers ── */
    function addMessage(text, from) {
        const isUser = from === "user";
        const bubble = document.createElement("div");
        bubble.innerHTML = text;
        Object.assign(bubble.style, {
            maxWidth:              "82%",
            padding:               "9px 13px",
            borderRadius:          "16px",
            fontSize:              "13px",
            lineHeight:            "1.5",
            alignSelf:             isUser ? "flex-end" : "flex-start",
            background:            isUser ? "#6366f1" : "#fff",
            color:                 isUser ? "#fff"    : "#374151",
            border:                isUser ? "none"    : "1px solid #e0e7ff",
            boxShadow:             isUser ? "0 2px 8px rgba(99,102,241,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
            borderBottomRightRadius: isUser ? "4px" : "16px",
            borderBottomLeftRadius:  isUser ? "16px" : "4px",
            animation:             "nexa-fade-in 0.2s ease-out",
            wordBreak:             "break-word",
        });
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    function addTypingIndicator() {
        const wrap = document.createElement("div");
        Object.assign(wrap.style, {
            display:    "flex",
            alignItems: "center",
            gap:        "5px",
            padding:    "10px 13px",
            background: "#fff",
            border:     "1px solid #e0e7ff",
            borderRadius: "16px",
            borderBottomLeftRadius: "4px",
            alignSelf:  "flex-start",
            boxShadow:  "0 1px 4px rgba(0,0,0,0.06)",
            animation:  "nexa-fade-in 0.2s ease-out",
        });
        [0, 150, 300].forEach(delay => {
            const dot = document.createElement("span");
            Object.assign(dot.style, {
                width:           "7px",
                height:          "7px",
                borderRadius:    "50%",
                background:      "#a5b4fc",
                display:         "inline-block",
                animation:       `nexa-bounce 1.2s ease-in-out infinite`,
                animationDelay:  `${delay}ms`,
            });
            wrap.appendChild(dot);
        });
        messages.appendChild(wrap);
        messages.scrollTop = messages.scrollHeight;
        return wrap;
    }

    /* ── Open / close ── */
    let isOpen = false;

    function openBox() {
        box.style.display = "flex";
        box.style.animation = "nexa-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards";
        isOpen = true;
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        setTimeout(() => input.focus(), 260);
    }

    function closeBox() {
        box.style.animation = "none";
        box.style.display = "none";
        isOpen = false;
        btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    }

    btn.addEventListener("click", () => isOpen ? closeBox() : openBox());
    closeBtn.addEventListener("click", closeBox);

    /* ── Greeting on first open ── */
    let greeted = false;
    btn.addEventListener("click", () => {
        if (!greeted && isOpen) {
            greeted = true;
            setTimeout(() => addMessage("👋 Hi! How can I help you today?", "ai"), 300);
        }
    });

    /* ── Send message ── */
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, "user");
        input.value = "";

        const typing = addTypingIndicator();

        try {
            const res  = await fetch(apiUrl, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ message: text, ownerId }),
            });
            const data = await res.json();
            messages.removeChild(typing);
            addMessage(data.response || "Sorry, something went wrong.", "ai");
        } catch {
            messages.removeChild(typing);
            addMessage("Sorry, something went wrong.", "ai");
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

})();
