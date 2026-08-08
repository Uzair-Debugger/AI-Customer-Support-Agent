import { injectStyles, addMessage, addTypingIndicator, parseMarkdown, adaptSvgStroke } from "./utils.js";
import { createButton, createBox } from "./ui.js";

// Captured synchronously — document.currentScript becomes null inside async callbacks
const scriptTag = document.currentScript;
const baseUrl   = new URL("/", scriptTag.src).href.replace(/\/$/, "");
const ownerId   = scriptTag.getAttribute("data-owner-id");

(async function () {

    if (!ownerId) {
        console.warn("[NexaSupport] data-owner-id is missing.");
        return;
    }

    /* ── 1. Fetch settings ── */
    let settings;
    try {
        const res = await fetch(`${baseUrl}/api/settings/get?ownerId=${ownerId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        settings = await res.json();
    } catch (err) {
        console.warn("[NexaSupport] Failed to load settings.", err);
        return;
    }

    // Only bail if owner explicitly disabled the widget
    if (settings?.isActive === false) return;

    // Fallback defaults if no settings record exists yet
    const s = {
        chatbotName:     settings?.chatbotName     || "Support",
        logo:            settings?.logo            || "",
        primaryColor:    settings?.primaryColor    || "#6366f1",
        secondaryColor:  settings?.secondaryColor  || "#4f46e5",
        widgetPosition:  settings?.widgetPosition  || "bottom-right",
        greetingMessage: settings?.greetingMessage || "👋 Hi! How can I help you today?",
    };

    /* ── 2. Inject styles ── */
    injectStyles(s.primaryColor, s.secondaryColor);

    /* ── 3. Mount UI ── */
    const btn = createButton(s);
    const box = createBox(s);
    document.body.appendChild(btn);
    document.body.appendChild(box);

    const messages = box.querySelector("#nexa-messages");
    const input    = box.querySelector("#nexa-input");
    const sendBtn  = box.querySelector("#nexa-send");
    const closeBtn = box.querySelector("#nexa-close");

    /* ── 4. Open / close ── */
    const CHAT_SVG = adaptSvgStroke(btn.innerHTML, s.primaryColor);
    const CLOSE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    let isOpen = false;
    let isSending = false;

    function openBox() {
        box.style.display   = "flex";
        box.style.animation = "nexa-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards";
        btn.innerHTML       = CLOSE_SVG;
        isOpen              = true;
        setTimeout(() => input.focus(), 260);
    }

    function closeBox() {
        box.style.animation = "none";
        box.style.display   = "none";
        btn.innerHTML       = CHAT_SVG;
        isOpen              = false;
    }

    btn.addEventListener("click", () => isOpen ? closeBox() : openBox());
    closeBtn.addEventListener("click", closeBox);

    /* ── 5. Greeting on first open ── */
    let greeted = false;
    btn.addEventListener("click", () => {
        if (!greeted && isOpen) {
            greeted = true;
            setTimeout(() => addMessage(messages, s.greetingMessage, "ai", s.primaryColor, s.secondaryColor), 300);
        }
    });

    /* ── 6. Send message ── */
    async function sendMessage() {
        if (isSending) return;
        isSending = true;

        const text = input.value.trim();
        if (!text) {
            isSending = false;
            return;
        }

        addMessage(messages, text, "user", s.primaryColor, s.secondaryColor);
        input.value = "";
        sendBtn.disabled = true;

        const typing = addTypingIndicator(messages, s.secondaryColor);

        try {
            const res = await fetch(`${baseUrl}/api/chat`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ message: text, ownerId }),
            });

            messages.removeChild(typing);
            const bubble = addMessage(messages, "", "ai", s.primaryColor, s.secondaryColor);

            const reader  = res.body.getReader();
            const decoder = new TextDecoder();
            let raw = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                raw += decoder.decode(value, { stream: true });
                bubble.innerHTML = parseMarkdown(raw);
                messages.scrollTop = messages.scrollHeight;
                await new Promise(r => setTimeout(r, 30));
            }

            if (!raw) bubble.innerHTML = "Sorry, something went wrong.";
        } catch {
            messages.removeChild(typing);
            addMessage(messages, "Sorry, something went wrong.", "ai", s.primaryColor, s.secondaryColor);
        } finally {
            sendBtn.disabled = false;
            isSending = false;
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

})();
