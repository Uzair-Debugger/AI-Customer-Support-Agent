import { injectStyles, addMessage, addTypingIndicator } from "./utils.js";
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

    if (!settings?.isActive) return;

    /* ── 2. Inject styles ── */
    injectStyles(settings.primaryColor, settings.secondaryColor);

    /* ── 3. Mount UI ── */
    const btn = createButton(settings);
    const box = createBox(settings);
    document.body.appendChild(btn);
    document.body.appendChild(box);

    const messages = box.querySelector("#nexa-messages");
    const input    = box.querySelector("#nexa-input");
    const sendBtn  = box.querySelector("#nexa-send");
    const closeBtn = box.querySelector("#nexa-close");

    /* ── 4. Open / close ── */
    const CHAT_SVG  = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    const CLOSE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    let isOpen = false;

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
            setTimeout(() => addMessage(messages, settings.greetingMessage || "👋 Hi! How can I help you today?", "ai", settings.primaryColor), 300);
        }
    });

    /* ── 6. Send message ── */
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(messages, text, "user", settings.primaryColor);
        input.value = "";

        const typing = addTypingIndicator(messages);

        try {
            const res  = await fetch(`${baseUrl}/api/chat`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ message: text, ownerId }),
            });
            const data = await res.json();
            messages.removeChild(typing);
            addMessage(messages, data.response || "Sorry, something went wrong.", "ai", settings.primaryColor);
        } catch {
            messages.removeChild(typing);
            addMessage(messages, "Sorry, something went wrong.", "ai", settings.primaryColor);
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

})();
