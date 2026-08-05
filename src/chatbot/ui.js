export function createButton(settings) {
    const { primaryColor, widgetPosition } = settings;
    const side = widgetPosition === "bottom-left" ? "left" : "right";

    const btn = document.createElement("button");
    btn.id = "nexa-btn";
    btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    Object.assign(btn.style, {
        position:       "fixed",
        bottom:         "24px",
        [side]:         "24px",
        width:          "56px",
        height:         "56px",
        borderRadius:   "50%",
        background:     primaryColor,
        color:          "#fff",
        border:         "none",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         "pointer",
        boxShadow:      `0 8px 32px ${primaryColor}70`,
        zIndex:         "999999",
        transition:     "opacity 0.2s, transform 0.2s",
    });
    return btn;
}

export function createBox(settings) {
    const { primaryColor, secondaryColor, widgetPosition, chatbotName, logo } = settings;
    const side = widgetPosition === "bottom-left" ? "left" : "right";

    const isSvg = typeof logo === "string" && logo.trimStart().startsWith("<");
    const logoHtml = isSvg
        ? `<span style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;">${logo}</span>`
        : `<span style="font-size:18px;line-height:1;">${logo || "💬"}</span>`;

    const box = document.createElement("div");
    box.id = "nexa-box";
    Object.assign(box.style, {
        position:        "fixed",
        bottom:          "92px",
        [side]:          "24px",
        width:           "340px",
        height:          "480px",
        background:      "#fff",
        borderRadius:    "20px",
        boxShadow:       "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        border:          "1px solid #e0e7ff",
        display:         "none",
        flexDirection:   "column",
        overflow:        "hidden",
        zIndex:          "999999",
        fontFamily:      "Inter, system-ui, -apple-system, sans-serif",
        transformOrigin: `bottom ${side}`,
    });

    box.innerHTML = `
        <div style="
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            padding: 14px 16px; display: flex; align-items: center;
            justify-content: space-between; flex-shrink: 0;
        ">
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="
                    width:36px; height:36px; border-radius:50%;
                    background:rgba(255,255,255,0.2);
                    display:flex; align-items:center; justify-content:center;
                ">${logoHtml}</div>
                <div>
                    <div style="color:#fff; font-size:14px; font-weight:600; line-height:1.2;">${chatbotName || "Support"}</div>
                    <div style="display:flex; align-items:center; gap:5px; margin-top:2px;">
                        <span style="
                            width:7px; height:7px; border-radius:50%; background:#4ade80;
                            display:inline-block; animation:nexa-pulse 2s ease-in-out infinite;
                        "></span>
                        <span style="color:rgba(255,255,255,0.85); font-size:11px; font-weight:500;">Online</span>
                    </div>
                </div>
            </div>
            <button id="nexa-close" style="
                background:rgba(255,255,255,0.15); border:none; color:#fff;
                width:28px; height:28px; border-radius:50%; cursor:pointer;
                font-size:14px; display:flex; align-items:center; justify-content:center;
                transition:background 0.15s;
            " onmouseover="this.style.background='rgba(255,255,255,0.25)'"
               onmouseout="this.style.background='rgba(255,255,255,0.15)'">✕</button>
        </div>

        <div id="nexa-messages" style="
            flex:1; padding:14px 12px; overflow-y:auto; background:#f8f9ff;
            display:flex; flex-direction:column; gap:8px;
        "></div>

        <div style="
            display:flex; align-items:center; gap:8px; padding:10px 12px;
            border-top:1px solid #e0e7ff; background:#fff; flex-shrink:0;
        ">
            <input id="nexa-input" type="text" placeholder="Type a message…" style="
                flex:1; padding:9px 13px; border:1.5px solid #e0e7ff;
                border-radius:12px; font-size:13px; font-family:inherit;
                background:#f8f9ff; color:#1e1b4b;
                transition:border-color 0.2s, box-shadow 0.2s;
            "/>
            <button id="nexa-send" style="
                width:36px; height:36px; border-radius:10px; background:${primaryColor};
                border:none; color:#fff; cursor:pointer;
                display:flex; align-items:center; justify-content:center;
                flex-shrink:0; transition:opacity 0.2s;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        </div>
    `;

    return box;
}
