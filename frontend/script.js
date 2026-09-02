/*
const API_URL = "http://localhost:8000";

const chatMessages = document.getElementById("chatMessages");
const questionInput = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");


// ======================================================
// ASK QUESTION
// ======================================================

async function askQuestion() {

    const question = questionInput.value.trim();

    // Don't send empty questions
    if (!question) {
        return;
    }

    // Show user's question
    addMessage(question, "user");

    // Clear input
    questionInput.value = "";

    // Disable button while processing
    sendButton.disabled = true;
    sendButton.innerText = "⏳";


    // Show loading message
    const loadingMessage = addMessage(
        "Searching the knowledge base...",
        "assistant"
    );


    try {

        console.log("Sending question:", question);

        const response = await fetch(`${API_URL}/ask`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })
        });


        console.log("Response status:", response.status);


        // Remove loading message
        loadingMessage.remove();


        if (!response.ok) {
            throw new Error(
                `Backend returned HTTP ${response.status}`
            );
        }


        const data = await response.json();

        console.log("Backend response:", data);


        // Display AI answer
        addMessage(
            data.answer || "I could not generate an answer.",
            "assistant"
        );


    } catch (error) {

        console.error("API Error:", error);

        loadingMessage.remove();

        addMessage(
            "I could not connect to the application service. Please make sure the Docker services are running.",
            "assistant"
        );

    } finally {

        sendButton.disabled = false;
        sendButton.innerText = "➤";

    }
}



// ======================================================
// ADD MESSAGE TO CHAT
// ======================================================

function addMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        type === "user"
            ? "user-message"
            : "assistant-message"
    );


    if (type === "user") {

        message.innerHTML = `
            <div class="avatar">
                👤
            </div>

            <div class="message-content">

                <div class="message-name">
                    You
                </div>

                <div class="bubble">
                    ${escapeHtml(text)}
                </div>

            </div>
        `;

    } else {

        message.innerHTML = `
            <div class="avatar">
                ✦
            </div>

            <div class="message-content">

                <div class="message-name">
                    PolicySphere AI
                </div>

                <div class="bubble">
                    ${escapeHtml(text)}
                </div>

            </div>
        `;

    }


    chatMessages.appendChild(message);

    // Scroll to newest message
    chatMessages.scrollTop = chatMessages.scrollHeight;


    return message;
}



// ======================================================
// QUICK TOPIC BUTTONS
// ======================================================

function setQuestion(question) {

    questionInput.value = question;

    questionInput.focus();

}



// ======================================================
// PRESS ENTER TO SEND
// ======================================================

questionInput.addEventListener("keydown", function(event) {

    // Enter = send
    // Shift + Enter = new line

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        askQuestion();

    }

});



// ======================================================
// BASIC HTML ESCAPING
// ======================================================

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}

*/


// ======================================================
// CONFIGURATION
// ======================================================

const API_URL = "http://localhost:8000";


// ======================================================
// DOM ELEMENTS
// ======================================================

const chatMessages = document.getElementById("chatMessages");

const questionInput = document.getElementById("questionInput");

const sendButton = document.getElementById("sendButton");

const historyList = document.getElementById("historyList");

const systemPanel = document.getElementById("systemPanel");


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    loadHistory();

    checkSystemStatus();

});


// ======================================================
// ASK QUESTION
// ======================================================

async function askQuestion() {

    const question = questionInput.value.trim();


    // Don't send empty questions
    if (!question) {
        return;
    }


    // Add question to recent history
    addToHistory(question);


    // Show user's question
    addMessage(question, "user");


    // Clear input
    questionInput.value = "";


    // Disable send button
    sendButton.disabled = true;

    sendButton.innerText = "⏳";


    // Show loading message
    const loadingMessage = addLoadingMessage();


    try {

        console.log("Sending question:", question);


        const response = await fetch(
            `${API_URL}/ask`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question
                })
            }
        );


        console.log(
            "Response status:",
            response.status
        );


        // Remove loading
        loadingMessage.remove();


        if (!response.ok) {

            throw new Error(
                `Backend returned HTTP ${response.status}`
            );

        }


        const data = await response.json();


        console.log(
            "Backend response:",
            data
        );


        // Display AI response
        addMessage(
            data.answer ||
            "I could not generate an answer.",
            "assistant"
        );


    } catch (error) {

        console.error(
            "API Error:",
            error
        );


        loadingMessage.remove();


        addMessage(
            "I could not connect to the application service. Please make sure the Docker services are running.",
            "assistant"
        );


    } finally {

        sendButton.disabled = false;

        sendButton.innerText = "➤";

    }

}


// ======================================================
// ADD MESSAGE
// ======================================================

function addMessage(text, type) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message",
        type === "user"
            ? "user-message"
            : "assistant-message"
    );


    if (type === "user") {

        message.innerHTML = `

            <div class="avatar">
                👤
            </div>

            <div class="message-content">

                <div class="message-name">
                    You
                </div>

                <div class="bubble">
                    ${escapeHtml(text)}
                </div>

            </div>

        `;

    } else {

        message.innerHTML = `

            <div class="avatar">
                ✦
            </div>

            <div class="message-content">

                <div class="message-name">
                    OrgMind AI
                </div>

                <div class="bubble">
                    ${escapeHtml(text)}
                </div>

            </div>

        `;

    }


    chatMessages.appendChild(message);


    // Scroll to newest message
    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return message;

}


// ======================================================
// LOADING MESSAGE
// ======================================================

function addLoadingMessage() {

    const message =
        document.createElement("div");


    message.classList.add(
        "message",
        "assistant-message"
    );


    message.innerHTML = `

        <div class="avatar">
            ✦
        </div>

        <div class="message-content">

            <div class="message-name">
                OrgMind AI
            </div>

            <div class="bubble loading-bubble">

                <span class="loading-text">
                    Searching knowledge base
                </span>

                <div class="loading">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>

        </div>

    `;


    chatMessages.appendChild(message);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return message;

}


// ======================================================
// QUICK QUESTIONS
// ======================================================

function setQuestion(question) {

    questionInput.value = question;

    questionInput.focus();

}


// ======================================================
// RECENT QUESTIONS
// ======================================================

function addToHistory(question) {

    let history =
        JSON.parse(
            localStorage.getItem("orgmindHistory")
        ) || [];


    // Remove duplicate
    history =
        history.filter(
            item => item !== question
        );


    // Add newest question first
    history.unshift(question);


    // Keep only 6 questions
    history = history.slice(0, 6);


    localStorage.setItem(
        "orgmindHistory",
        JSON.stringify(history)
    );


    renderHistory(history);

}


// ======================================================
// LOAD HISTORY
// ======================================================

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("orgmindHistory")
        ) || [];


    renderHistory(history);

}


// ======================================================
// DISPLAY HISTORY
// ======================================================

function renderHistory(history) {

    historyList.innerHTML = "";


    if (history.length === 0) {

        historyList.innerHTML = `

            <div class="empty-history">
                No recent questions
            </div>

        `;

        return;

    }


    history.forEach(function (question) {

        const button =
            document.createElement("button");


        button.className =
            "history-item";


        button.title = question;


        button.innerHTML = `

            <span class="history-icon">
                💬
            </span>

            <span class="history-text">
                ${escapeHtml(question)}
            </span>

        `;


        button.onclick = function () {

            setQuestion(question);

        };


        historyList.appendChild(button);

    });

}


// ======================================================
// CLEAR HISTORY
// ======================================================

function clearHistory() {

    localStorage.removeItem(
        "orgmindHistory"
    );


    renderHistory([]);

}


// ======================================================
// SYSTEM STATUS PANEL
// ======================================================

function toggleSystemPanel() {

    systemPanel.classList.toggle(
        "show"
    );


    // Check services whenever panel opens
    if (
        systemPanel.classList.contains("show")
    ) {

        checkSystemStatus();

    }

}


// ======================================================
// CHECK SYSTEM STATUS
// ======================================================

async function checkSystemStatus() {

    const appStatus =
        document.getElementById(
            "appServiceStatus"
        );

    const retrievalStatus =
        document.getElementById(
            "retrievalServiceStatus"
        );

    const llmStatus =
        document.getElementById(
            "llmServiceStatus"
        );

    const ollamaStatus =
        document.getElementById(
            "ollamaServiceStatus"
        );


    // Initially checking

    setServiceStatus(
        appStatus,
        "checking",
        "Checking..."
    );

    setServiceStatus(
        retrievalStatus,
        "checking",
        "Checking..."
    );

    setServiceStatus(
        llmStatus,
        "checking",
        "Checking..."
    );

    setServiceStatus(
        ollamaStatus,
        "checking",
        "Checking..."
    );


    try {

        const response =
            await fetch(
                `${API_URL}/`,
                {
                    method: "GET"
                }
            );


        if (response.ok) {

            setServiceStatus(
                appStatus,
                "online",
                "Online"
            );

            setServiceStatus(
                retrievalStatus,
                "online",
                "Connected"
            );

            setServiceStatus(
                llmStatus,
                "online",
                "Connected"
            );

            setServiceStatus(
                ollamaStatus,
                "online",
                "Connected"
            );


            updateMainStatus(
                true
            );

        } else {

            throw new Error(
                "Application service unavailable"
            );

        }


    } catch (error) {

        console.error(
            "System status error:",
            error
        );


        setServiceStatus(
            appStatus,
            "offline",
            "Offline"
        );

        setServiceStatus(
            retrievalStatus,
            "offline",
            "Unavailable"
        );

        setServiceStatus(
            llmStatus,
            "offline",
            "Unavailable"
        );

        setServiceStatus(
            ollamaStatus,
            "offline",
            "Unavailable"
        );


        updateMainStatus(
            false
        );

    }

}


// ======================================================
// UPDATE SERVICE STATUS
// ======================================================

function setServiceStatus(
    element,
    status,
    text
) {

    element.className =
        `service-status ${status}`;

    element.innerText =
        text;

}


// ======================================================
// UPDATE HEADER STATUS
// ======================================================

function updateMainStatus(isOnline) {

    const dot =
        document.getElementById(
            "mainStatusDot"
        );

    const text =
        document.getElementById(
            "mainStatusText"
        );


    if (isOnline) {

        dot.className =
            "status-dot";

        text.innerText =
            "Services Connected";

    } else {

        dot.className =
            "status-dot offline-dot";

        text.innerText =
            "Service Issue";

    }

}


// ======================================================
// ENTER TO SEND
// ======================================================

questionInput.addEventListener(
    "keydown",
    function (event) {

        // Enter = send
        // Shift + Enter = new line

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            askQuestion();

        }

    }
);


// ======================================================
// AUTO RESIZE TEXTAREA
// ======================================================

questionInput.addEventListener(
    "input",
    function () {

        this.style.height =
            "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                140
            ) + "px";

    }
);


// ======================================================
// HTML ESCAPING
// ======================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}