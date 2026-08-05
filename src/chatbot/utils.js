function luminance(hex) {
    const c = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map(i => {
        const v = parseInt(c.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readableTextColor(bgHex) {
    return luminance(bgHex) > 0.35 ? "#1a1a2e" : "#ffffff";
}

function ensureVisible(hex) {
    return luminance(hex) > 0.85 ? "#e8e8ee" : hex;
}

export function parseMarkdown(text) {
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/^### (.+)$/gm, "<h4 style='margin:10px 0 4px;font-size:13px;font-weight:700;'>$1</h4>")
        .replace(/^## (.+)$/gm,  "<h3 style='margin:10px 0 4px;font-size:14px;font-weight:700;'>$1</h3>")
        .replace(/^# (.+)$/gm,   "<h2 style='margin:10px 0 4px;font-size:15px;font-weight:700;'>$1</h2>")
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code style='background:rgba(0,0,0,0.12);padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace;'>$1</code>")
        .replace(/^[\-\*] (.+)$/gm, "<li style='margin:3px 0 3px 16px;list-style:disc;'>$1</li>")
        .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style='margin:6px 0;padding:0;'>${m}</ul>`)
        .replace(/^\d+\. (.+)$/gm, "<li style='margin:3px 0 3px 16px;list-style:decimal;'>$1</li>")
        .replace(/^---$/gm, "<hr style='border:none;border-top:1px solid rgba(0,0,0,0.1);margin:8px 0;'/>")
        .replace(/\n{2,}/g, "<br/><br/>")
        .replace(/\n/g, "<br/>");
}

export function addMessage(messages, text, from, primaryColor, secondaryColor) {
    const isUser  = from === "user";
    const bgColor = ensureVisible(isUser ? primaryColor : secondaryColor);
    const txColor = readableTextColor(bgColor);

    const bubble = document.createElement("div");
    bubble.innerHTML = isUser
        ? text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : parseMarkdown(text);
    Object.assign(bubble.style, {
        maxWidth:                "82%",
        padding:                 "9px 13px",
        borderRadius:            "16px",
        fontSize:                "13px",
        lineHeight:              "1.5",
        alignSelf:               isUser ? "flex-end" : "flex-start",
        background:              bgColor,
        color:                   txColor,
        border:                  "1px solid rgba(0,0,0,0.15)",
        boxShadow:               `0 2px 8px ${bgColor}40`,
        borderBottomRightRadius: isUser ? "4px" : "16px",
        borderBottomLeftRadius:  isUser ? "16px" : "4px",
        animation:               "nexa-fade-in 0.2s ease-out",
        wordBreak:               "break-word",
    });
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
}

export function addTypingIndicator(messages, secondaryColor) {
    const bgColor  = ensureVisible(secondaryColor);
    const dotColor = readableTextColor(bgColor);
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
        display:                "flex",
        alignItems:             "center",
        gap:                    "5px",
        padding:                "10px 13px",
        background:             bgColor,
        borderRadius:           "16px",
        borderBottomLeftRadius: "4px",
        alignSelf:              "flex-start",
        border:                 "1px solid rgba(0,0,0,0.15)",
        boxShadow:              `0 2px 8px ${bgColor}40`,
        animation:              "nexa-fade-in 0.2s ease-out",
    });
    [0, 150, 300].forEach(delay => {
        const dot = document.createElement("span");
        Object.assign(dot.style, {
            width:          "7px",
            height:         "7px",
            borderRadius:   "50%",
            background:     dotColor,
            opacity:        "0.7",
            display:        "inline-block",
            animation:      "nexa-bounce 1.2s ease-in-out infinite",
            animationDelay: `${delay}ms`,
        });
        wrap.appendChild(dot);
    });
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
}

export function injectStyles(primaryColor, secondaryColor) {
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
