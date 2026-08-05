export function parseMarkdown(text) {
    return text
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/^### (.+)$/gm, "<h4 style='margin:10px 0 4px;font-size:13px;font-weight:700;color:#1e1b4b;'>$1</h4>")
        .replace(/^## (.+)$/gm,  "<h3 style='margin:10px 0 4px;font-size:14px;font-weight:700;color:#1e1b4b;'>$1</h3>")
        .replace(/^# (.+)$/gm,   "<h2 style='margin:10px 0 4px;font-size:15px;font-weight:700;color:#1e1b4b;'>$1</h2>")
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code style='background:#ede9fe;color:#4f46e5;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace;'>$1</code>")
        .replace(/^[\-\*] (.+)$/gm, "<li style='margin:3px 0 3px 16px;list-style:disc;'>$1</li>")
        .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style='margin:6px 0;padding:0;'>${m}</ul>`)
        .replace(/^\d+\. (.+)$/gm, "<li style='margin:3px 0 3px 16px;list-style:decimal;'>$1</li>")
        .replace(/^---$/gm, "<hr style='border:none;border-top:1px solid #e0e7ff;margin:8px 0;'/>")
        .replace(/\n{2,}/g, "<br/><br/>")
        .replace(/\n/g, "<br/>");
}

export function addMessage(messages, text, from, primaryColor) {
    const isUser = from === "user";
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
        background:              isUser ? primaryColor : "#fff",
        color:                   isUser ? "#fff" : "#374151",
        border:                  isUser ? "none" : "1px solid #e0e7ff",
        boxShadow:               isUser ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
        borderBottomRightRadius: isUser ? "4px" : "16px",
        borderBottomLeftRadius:  isUser ? "16px" : "4px",
        animation:               "nexa-fade-in 0.2s ease-out",
        wordBreak:               "break-word",
    });
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
}

export function addTypingIndicator(messages) {
    const wrap = document.createElement("div");
    Object.assign(wrap.style, {
        display:                "flex",
        alignItems:             "center",
        gap:                    "5px",
        padding:                "10px 13px",
        background:             "#fff",
        border:                 "1px solid #e0e7ff",
        borderRadius:           "16px",
        borderBottomLeftRadius: "4px",
        alignSelf:              "flex-start",
        boxShadow:              "0 1px 4px rgba(0,0,0,0.06)",
        animation:              "nexa-fade-in 0.2s ease-out",
    });
    [0, 150, 300].forEach(delay => {
        const dot = document.createElement("span");
        Object.assign(dot.style, {
            width:          "7px",
            height:         "7px",
            borderRadius:   "50%",
            background:     "#a5b4fc",
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
        #nexa-messages::-webkit-scrollbar-thumb { background: ${secondaryColor}80; border-radius: 99px; }
        #nexa-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 3px ${primaryColor}26; }
        #nexa-send:hover  { opacity: 0.85; }
        #nexa-btn:hover   { opacity: 0.85; transform: scale(1.08); }
    `;
    document.head.appendChild(style);
}
