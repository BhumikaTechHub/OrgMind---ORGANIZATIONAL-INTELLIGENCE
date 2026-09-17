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
    renderEvaluationDashboard();

});


// ======================================================
// ASK QUESTION
// ======================================================

async function askQuestion() {

    const question = questionInput.value.trim();

    if (!question) {
        return;
    }

    // Add to recent history
    addToHistory(question);

    // Display user's question
    addMessage(question, "user");

    // Clear input
    questionInput.value = "";

    // Disable send button
    sendButton.disabled = true;
    sendButton.innerText = "⏳";

    // Show loading
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

        // Display answer
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
                    OrgMind AI
                </div>

                <div class="bubble">
                    ${escapeHtml(text)}
                </div>

            </div>

        `;

    }


    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    return message;

}


// ======================================================
// LOADING MESSAGE
// ======================================================

function addLoadingMessage() {

    const message = document.createElement("div");

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


    // Add newest first
    history.unshift(question);


    // Keep only 6
    history =
        history.slice(0, 6);


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


        button.title =
            question;


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


            updateMainStatus(true);

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


        updateMainStatus(false);

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

    if (!element) {
        return;
    }

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


    if (!dot || !text) {
        return;
    }


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


// ======================================================
// WEEK 4 - EVALUATION DATA
// ======================================================

const evaluationData = {

    totalQuestions: 30,

    successfulResponses: 26,

    timeouts: 4,


    models: [

        {
            name: "Qwen2.5 0.5B",
            id: "qwen2.5:0.5b",

            questions: 9,

            accuracy: 88.89,
            relevance: 88.89,
            retrieval: 100,
            hallucination: 0,

            latency: 44.258,

            promptTokens: 996.00,
            responseTokens: 88.56,
            totalTokens: 1084.56,

            timeoutRate: 10,

            cpu: "5468.83%",
            memory: "820.8 MiB"
        },


        {
            name: "Gemma 3 270M",
            id: "gemma3:270m",

            questions: 10,

            accuracy: 0,
            relevance: 0,
            retrieval: 100,
            hallucination: 0,

            latency: 20.183,

            promptTokens: 1039.00,
            responseTokens: 12.80,
            totalTokens: 1051.80,

            timeoutRate: 0,

            cpu: "251.02%",
            memory: "793.8 MiB"
        },


        {
            name: "SmolLM2 360M",
            id: "smollm2:360m",

            questions: 7,

            accuracy: 71.43,
            relevance: 85.71,
            retrieval: 100,
            hallucination: 28.57,

            latency: 76.158,

            promptTokens: 736.14,
            responseTokens: 121.57,
            totalTokens: 857.71,

            timeoutRate: 30,

            cpu: "409.74%",
            memory: "1.113 GiB"
        }

    ]

};


// ======================================================
// SHOW EVALUATION VIEW
// ======================================================

function showEvaluationView() {

    const chatView =
        document.getElementById(
            "chatView"
        );

    const dashboard =
        document.getElementById(
            "evaluationDashboard"
        );

    const chatNav =
        document.getElementById(
            "chatNav"
        );

    const evaluationNav =
        document.getElementById(
            "evaluationNav"
        );


    if (!chatView || !dashboard) {
        return;
    }


    chatView.style.display =
        "none";

    dashboard.classList.add(
        "active"
    );


    if (chatNav) {

        chatNav.classList.remove(
            "active"
        );

    }


    if (evaluationNav) {

        evaluationNav.classList.add(
            "active"
        );

    }


    const breadcrumb =
        document.querySelector(
            ".breadcrumb"
        );

    const topTitle =
        document.querySelector(
            ".topbar h1"
        );


    if (breadcrumb) {

        breadcrumb.innerText =
            "WEEK 4 • EVALUATION";

    }


    if (topTitle) {

        topTitle.innerText =
            "Evaluation Dashboard";

    }


    renderEvaluationDashboard();

}


// ======================================================
// SHOW CHAT VIEW
// ======================================================

function showChatView() {

    const chatView =
        document.getElementById(
            "chatView"
        );

    const dashboard =
        document.getElementById(
            "evaluationDashboard"
        );

    const chatNav =
        document.getElementById(
            "chatNav"
        );

    const evaluationNav =
        document.getElementById(
            "evaluationNav"
        );


    if (!chatView || !dashboard) {
        return;
    }


    dashboard.classList.remove(
        "active"
    );

    chatView.style.display =
        "";


    if (chatNav) {

        chatNav.classList.add(
            "active"
        );

    }


    if (evaluationNav) {

        evaluationNav.classList.remove(
            "active"
        );

    }


    const breadcrumb =
        document.querySelector(
            ".breadcrumb"
        );

    const topTitle =
        document.querySelector(
            ".topbar h1"
        );


    if (breadcrumb) {

        breadcrumb.innerText =
            "ORGANIZATIONAL INTELLIGENCE";

    }


    if (topTitle) {

        topTitle.innerText =
            "OrgMind";

    }

}


// ======================================================
// RENDER EVALUATION DASHBOARD
// ======================================================

function renderEvaluationDashboard() {

    const dashboard =
        document.getElementById(
            "evaluationDashboard"
        );


    if (!dashboard) {
        return;
    }


    dashboard.innerHTML = `

        <!-- ================= HEADER ================= -->

        <div class="evaluation-header">

            <div>

                <span class="evaluation-label">
                    WEEK 4
                </span>

                <h2>
                    Model Evaluation Dashboard
                </h2>

                <p>
                    Quantitative evaluation of OrgMind using
                    three locally hosted LLM models under the
                    same RAG pipeline.
                </p>

            </div>

        </div>


        <!-- ================= OVERVIEW ================= -->

        <div class="evaluation-overview">


            <div class="eval-stat-card">

                <span class="eval-stat-label">
                    Models Tested
                </span>

                <strong>
                    3
                </strong>

                <small>
                    Local LLM models
                </small>

            </div>


            <div class="eval-stat-card">

                <span class="eval-stat-label">
                    Planned Evaluations
                </span>

                <strong>
                    30
                </strong>

                <small>
                    10 questions × 3 models
                </small>

            </div>


            <div class="eval-stat-card">

                <span class="eval-stat-label">
                    Successful Responses
                </span>

                <strong>
                    26
                </strong>

                <small>
                    86.67% completed
                </small>

            </div>


            <div class="eval-stat-card">

                <span class="eval-stat-label">
                    Timeouts
                </span>

                <strong>
                    4
                </strong>

                <small>
                    13.33% of planned runs
                </small>

            </div>


        </div>


        <!-- ================= QUALITY ================= -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Model Quality
                </h3>

                <p>
                    Manual evaluation of completed responses.
                </p>

            </div>


            <div class="model-cards">


                ${evaluationData.models.map(model => `

                    <div class="model-card">


                        <div class="model-card-header">

                            <div>

                                <h3>
                                    ${model.name}
                                </h3>

                                <span>
                                    ${model.id}
                                </span>

                            </div>


                            <div class="question-count">

                                ${model.questions}/10

                                <small>
                                    completed
                                </small>

                            </div>

                        </div>


                        <div class="metric-group">


                            <div class="metric-row">

                                <span>
                                    Accuracy
                                </span>

                                <strong>
                                    ${model.accuracy}%
                                </strong>

                            </div>


                            <div class="metric-bar">

                                <div
                                    style="width:${model.accuracy}%">
                                </div>

                            </div>


                            <div class="metric-row">

                                <span>
                                    Relevance
                                </span>

                                <strong>
                                    ${model.relevance}%
                                </strong>

                            </div>


                            <div class="metric-bar">

                                <div
                                    style="width:${model.relevance}%">
                                </div>

                            </div>


                            <div class="metric-row">

                                <span>
                                    Retrieval Quality
                                </span>

                                <strong>
                                    ${model.retrieval}%
                                </strong>

                            </div>


                            <div class="metric-bar">

                                <div
                                    style="width:${model.retrieval}%">
                                </div>

                            </div>


                            <div class="metric-row">

                                <span>
                                    Hallucination Rate
                                </span>

                                <strong>
                                    ${model.hallucination}%
                                </strong>

                            </div>


                            <div class="metric-bar danger-bar">

                                <div
                                    style="width:${model.hallucination}%">
                                </div>

                            </div>


                        </div>

                    </div>

                `).join("")}


            </div>

        </section>


        <!-- ================= QUALITY TABLE ================= -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Quality Comparison
                </h3>

                <p>
                    Results from the manual scoring sheet.
                </p>

            </div>


            <div class="evaluation-table-wrapper">

                <table class="evaluation-table">

                    <thead>

                        <tr>

                            <th>
                                Metric
                            </th>

                            ${evaluationData.models.map(
                                model =>
                                `<th>${model.name}</th>`
                            ).join("")}

                        </tr>

                    </thead>


                    <tbody>


                        <tr>

                            <td>
                                Completed Questions
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.questions}</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Accuracy
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.accuracy}%</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Relevance
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.relevance}%</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Retrieval Quality
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.retrieval}%</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Hallucination Rate
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.hallucination}%</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Test-Pass Rate
                            </td>

                            ${evaluationData.models.map(
                                () =>
                                `<td>N/A</td>`
                            ).join("")}

                        </tr>


                    </tbody>

                </table>

            </div>

        </section>


        <!-- ================= PERFORMANCE ================= -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Performance Metrics
                </h3>

                <p>
                    Measured during the same RAG evaluation setup.
                </p>

            </div>


            <div class="evaluation-table-wrapper">

                <table class="evaluation-table">

                    <thead>

                        <tr>

                            <th>
                                Metric
                            </th>

                            ${evaluationData.models.map(
                                model =>
                                `<th>${model.name}</th>`
                            ).join("")}

                        </tr>

                    </thead>


                    <tbody>


                        <tr>

                            <td>
                                Average Latency
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.latency}s</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Minimum Latency
                            </td>

                            <td>
                                7.773s
                            </td>

                            <td>
                                7.850s
                            </td>

                            <td>
                                17.430s
                            </td>

                        </tr>


                        <tr>

                            <td>
                                Maximum Latency
                            </td>

                            <td>
                                119.731s
                            </td>

                            <td>
                                41.495s
                            </td>

                            <td>
                                137.619s
                            </td>

                        </tr>


                        <tr>

                            <td>
                                Avg Prompt Tokens
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.promptTokens}</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Avg Response Tokens
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.responseTokens}</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Avg Total Tokens
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.totalTokens}</td>`
                            ).join("")}

                        </tr>


                        <tr>

                            <td>
                                Timeout Rate
                            </td>

                            ${evaluationData.models.map(
                                model =>
                                `<td>${model.timeoutRate}%</td>`
                            ).join("")}

                        </tr>


                    </tbody>

                </table>

            </div>

        </section>


        <!-- ================= CPU MEMORY ================= -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    CPU & Memory Consumption
                </h3>

                <p>
                    Observed Docker statistics during model inference.
                </p>

            </div>


            <div class="resource-grid">


                ${evaluationData.models.map(model => `

                    <div class="resource-card">

                        <h3>
                            ${model.name}
                        </h3>


                        <div class="resource-item">

                            <span>
                                CPU
                            </span>

                            <strong>
                                ${model.cpu}
                            </strong>

                        </div>


                        <div class="resource-item">

                            <span>
                                Memory
                            </span>

                            <strong>
                                ${model.memory}
                            </strong>

                        </div>

                    </div>

                `).join("")}


            </div>


            <p class="resource-note">

                CPU percentage can exceed 100% because Docker
                reports multi-core CPU utilization. These values
                represent observed resource usage during inference,
                not a controlled hardware benchmark.

            </p>

        </section>


        <!-- ================= LATENCY CHART ================= -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Average Response Latency
                </h3>

                <p>
                    Response time measured during evaluation.
                </p>

            </div>


            <div class="chart-container">


                ${evaluationData.models.map(model => {

                    const maxLatency = 80;

                    const width =
                        Math.min(
                            (model.latency / maxLatency) * 100,
                            100
                        );


                    return `

                        <div class="chart-row">


                            <div class="chart-label">

                                ${model.name}

                            </div>


                            <div class="chart-track">

                                <div
                                    class="chart-bar"
                                    style="width:${width}%">
                                </div>

                            </div>


                            <div class="chart-value">

                                ${model.latency}s

                            </div>


                        </div>

                    `;

                }).join("")}


            </div>

        </section>


        <!-- ================= METHODOLOGY ================= -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Metric Definitions
                </h3>

                <p>
                    How the Week 4 metrics were calculated.
                </p>

            </div>


            <div class="methodology-grid">


                <div class="method-card">

                    <h3>
                        Accuracy
                    </h3>

                    <p>
                        Correct answers ÷ completed evaluated
                        questions × 100.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        Relevance
                    </h3>

                    <p>
                        Relevant responses ÷ completed evaluated
                        questions × 100.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        Retrieval Quality
                    </h3>

                    <p>
                        Questions where retrieved context contained
                        the required information ÷ evaluated questions
                        × 100.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        Hallucination Rate
                    </h3>

                    <p>
                        Responses containing unsupported information
                        ÷ evaluated responses × 100.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        Response Latency
                    </h3>

                    <p>
                        Time measured from sending the request until
                        the application returned the response.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        Token Usage
                    </h3>

                    <p>
                        Prompt tokens + generated response tokens.
                        Average usage was calculated for each model.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        CPU / Memory
                    </h3>

                    <p>
                        Docker resource statistics were observed
                        during inference and recorded for comparison.
                    </p>

                </div>


                <div class="method-card">

                    <h3>
                        Test-Pass Rate
                    </h3>

                    <p>
                        N/A for OrgMind because it generates
                        natural-language organizational policy
                        answers rather than executable code.
                    </p>

                </div>


            </div>

        </section>


        <!-- ================= EVALUATION NOTE ================= -->

        <section class="evaluation-note">

            <strong>
                Evaluation Status
            </strong>


            <p>

                30 model-question evaluations were planned.
                26 responses completed successfully and 4 evaluations
                timed out. Timeout runs are reported separately and
                were not treated as incorrect answers.

            </p>

        </section>

    `;

}