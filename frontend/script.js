// ======================================================
// ORGMIND - SCRIPT.JS
// ======================================================

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
const modelSelect = document.getElementById("modelSelect");
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
// MODEL DISPLAY NAME
// ======================================================

function getModelDisplayName(model) {

    const names = {
        "qwen2.5:0.5b": "Qwen 2.5 0.5B",
        "gemma3:270m": "Gemma 3 270M",
        "smollm2:360m": "SmolLM2 360M"
    };

    return names[model] || model;
}


// ======================================================
// MODEL BAR CLASS
// ======================================================

function getModelBarClass(modelId) {

    if (modelId === "qwen2.5:0.5b") {
        return "qwen-bar";
    }

    if (modelId === "gemma3:270m") {
        return "gemma-bar";
    }

    if (modelId === "smollm2:360m") {
        return "smollm-bar";
    }

    return "";
}


// ======================================================
// ASK QUESTION
// ======================================================

// ======================================================
// ASK QUESTION
// ======================================================

async function askQuestion() {

    const question = questionInput.value.trim();

    const selectedModel = modelSelect
        ? modelSelect.value
        : "all";

    if (!question) {
        return;
    }

    addToHistory(question);

    addMessage(
        question +
        "\n\nMode: " +
        (
            selectedModel === "all"
                ? "Compare All Models"
                : getModelDisplayName(selectedModel)
        ),
        "user"
    );

    questionInput.value = "";
    questionInput.style.height = "auto";

    sendButton.disabled = true;
    sendButton.innerText = "⏳";

    try {

        // ==================================================
        // COMPARE ALL MODELS
        // ==================================================

        if (selectedModel === "all") {

            addMessage(
                "Running the question on Qwen, Gemma and SmolLM2...",
                "assistant"
            );

            const models = [
                "qwen2.5:0.5b",
                "gemma3:270m",
                "smollm2:360m"
            ];

            const startTime = performance.now();

            const responses = [];

            for (const model of models) {

                console.log(
                    `Running ${model}...`
                );

                const result =
                    await askModel(
                        question,
                        model
                    );

                responses.push(result);

                console.log(
                    `${model} result:`,
                    result
                );
            }

            const totalTime =
                (performance.now() - startTime) / 1000;

            console.log(
                "All model responses:",
                responses
            );

            renderLiveModelComparison(
                question,
                responses,
                totalTime
            );

        }

        // ==================================================
        // SINGLE MODEL
        // ==================================================

        else {

            const loadingMessage =
                addLoadingMessage(selectedModel);

            const result =
                await askModel(
                    question,
                    selectedModel
                );

            loadingMessage.remove();

            renderSingleModelResult(
                question,
                result
            );
        }

    } catch (error) {

        console.error(
            "Evaluation Error:",
            error
        );

        addMessage(
            "I could not generate the response. " +
            "Please make sure all Docker services are running.",
            "assistant"
        );

    } finally {

        sendButton.disabled = false;
        sendButton.innerText = "➤";
    }
}


// ======================================================
// ASK ONE MODEL
// ======================================================

async function askModel(question, model) {

    const startTime = performance.now();

    try {

        const response = await fetch(
            `${API_URL}/ask`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question,
                    model: model
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                `Backend returned HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        const clientLatency =
            (performance.now() - startTime) / 1000;

        return {
            success: true,
            model: data.model || model,
            answer: data.answer || "",
            context: data.context || "",

            latency:
                data.latency_seconds ??
                clientLatency,

            promptTokens:
                data.prompt_tokens ?? 0,

            responseTokens:
                data.response_tokens ?? 0,

            totalTokens:
                data.total_tokens ?? 0,

            tokensPerSecond:
                data.tokens_per_second ?? 0
        };

    } catch (error) {

        console.error(
            `${model} failed:`,
            error
        );

        return {
            success: false,
            model: model,
            answer: `Model failed to respond: ${error.message}`,
            latency: null,
            promptTokens: 0,
            responseTokens: 0,
            totalTokens: 0,
            tokensPerSecond: 0,
            error: error.message
        };
    }
}


// ======================================================
// SINGLE MODEL RESULT
// ======================================================

function renderSingleModelResult(
    question,
    result
) {

    const modelName =
        getModelDisplayName(result.model);

    addMessage(
        result.answer +
        "\n\nModel: " +
        modelName +
        "\nLatency: " +
        Number(result.latency).toFixed(3) +
        "s",
        "assistant"
    );

    const container =
        document.getElementById("liveEvaluationResults");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="live-result-section">

            <h2>Live Model Evaluation</h2>

            <p class="section-subtitle">
                Results for the selected model.
            </p>

            <div class="live-answer-card">

                <div class="live-answer-header">
                    <strong>${modelName}</strong>
                </div>

                <div class="live-answer-text">
                    ${escapeHTML(result.answer)}
                </div>

            </div>


            <div class="live-metrics-grid">

                <div class="live-metric-card">
                    <span>Latency</span>
                    <strong>
                        ${Number(result.latency).toFixed(3)}s
                    </strong>
                </div>

                <div class="live-metric-card">
                    <span>Prompt Tokens</span>
                    <strong>
                        ${result.promptTokens}
                    </strong>
                </div>

                <div class="live-metric-card">
                    <span>Response Tokens</span>
                    <strong>
                        ${result.responseTokens}
                    </strong>
                </div>

                <div class="live-metric-card">
                    <span>Total Tokens</span>
                    <strong>
                        ${result.totalTokens}
                    </strong>
                </div>

            </div>


            <div class="live-chart-card">

                <h3>Response Latency</h3>

                <div class="live-latency-chart">

                    <div class="live-latency-row">

                        <div class="live-latency-name">
                            ${modelName}
                        </div>

                        <div class="live-latency-track">

                            <div
                                class="live-latency-fill"
                                style="width:100%">
                            </div>

                        </div>

                        <strong>
                            ${Number(result.latency).toFixed(3)}s
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    `;
}


// ======================================================
// ALL MODEL COMPARISON
// ======================================================

function renderLiveModelComparison(
    question,
    results,
    totalTime
) {

    const successfulResults =
        results.filter(result => result.success);

    const maxLatency =
        Math.max(
            ...successfulResults.map(
                result => Number(result.latency) || 0
            ),
            1
        );

    const answerCards =
        results.map(result => {

            const modelName =
                getModelDisplayName(result.model);

            if (!result.success) {

                return `
                    <div class="live-answer-card">

                        <div class="live-answer-header">
                            <strong>${modelName}</strong>
                        </div>

                        <div class="live-answer-text">
                            Model failed to respond.
                        </div>

                    </div>
                `;
            }

            return `
                <div class="live-answer-card">

                    <div class="live-answer-header">
                        <strong>${modelName}</strong>

                        <span>
                            ${Number(result.latency).toFixed(3)}s
                        </span>
                    </div>

                    <div class="live-answer-text">
                        ${escapeHTML(result.answer)}
                    </div>

                </div>
            `;

        }).join("");


    const latencyRows =
        results.map(result => {

            if (!result.success) {
                return "";
            }

            const modelName =
                getModelDisplayName(result.model);

            const width =
                (
                    Number(result.latency) /
                    maxLatency
                ) * 100;

            return `
                <div class="live-latency-row">

                    <div class="live-latency-name">
                        ${modelName}
                    </div>

                    <div class="live-latency-track">

                        <div
                            class="live-latency-fill"
                            style="width:${width}%">
                        </div>

                    </div>

                    <strong>
                        ${Number(result.latency).toFixed(3)}s
                    </strong>

                </div>
            `;

        }).join("");


    const tokenRows =
        results.map(result => {

            if (!result.success) {
                return "";
            }

            const modelName =
                getModelDisplayName(result.model);

            return `
                <div class="live-token-row">

                    <div>
                        <strong>
                            ${modelName}
                        </strong>
                    </div>

                    <div>
                        Prompt:
                        ${result.promptTokens}
                    </div>

                    <div>
                        Response:
                        ${result.responseTokens}
                    </div>

                    <div>
                        Total:
                        ${result.totalTokens}
                    </div>

                </div>
            `;

        }).join("");


    const container =
        document.getElementById(
            "liveEvaluationResults"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="live-result-section">

            <h2>Live Model Comparison</h2>

            <p class="section-subtitle">
                The same question was evaluated using all
                three locally hosted models.
            </p>


            <!-- ANSWERS -->

            <div class="live-answer-grid">

                ${answerCards}

            </div>


            <!-- LATENCY -->

            <div class="live-chart-card">

                <h3>Response Latency Comparison</h3>

                <p class="section-subtitle">
                    Lower response time indicates faster generation.
                </p>

                <div class="live-latency-chart">

                    ${latencyRows}

                </div>

            </div>


            <!-- TOKENS -->

            <div class="live-chart-card">

                <h3>Token Usage</h3>

                <div class="live-token-chart">

                    ${tokenRows}

                </div>

            </div>


            <!-- SUMMARY -->

            <div class="live-summary-card">

                <strong>
                    Total evaluation time:
                </strong>

                ${Number(totalTime).toFixed(3)}s

            </div>

        </div>
    `;
}



// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;
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

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return message;
}


// ======================================================
// LOADING MESSAGE
// ======================================================

function addLoadingMessage(model) {

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
                    ${getModelDisplayName(model)}
                    is generating
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

    questionInput.value =
        question;

    questionInput.focus();
}


// ======================================================
// RECENT QUESTIONS
// ======================================================

function addToHistory(question) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "orgmindHistory"
            )
        ) || [];

    history =
        history.filter(
            item => item !== question
        );

    history.unshift(question);

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
            localStorage.getItem(
                "orgmindHistory"
            )
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

        button.onclick =
            function () {
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

    if (!systemPanel) {
        return;
    }

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
// SERVICE STATUS
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
// HEADER STATUS
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

if (questionInput) {

    questionInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                askQuestion();
            }
        }
    );



    // ==================================================
    // AUTO RESIZE TEXTAREA
    // ==================================================

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
}


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

    // Latest performance evaluation:
    // 30 planned = 27 successful + 3 timeouts
    totalQuestions: 30,
    successfulResponses: 27,
    timeouts: 3,

    models: [

        // ==================================================
        // QWEN
        // ==================================================

        {
            name: "Qwen2.5 0.5B",
            id: "qwen2.5:0.5b",

            // Quality
            questions: 9,
            accuracy: 88.89,
            relevance: 88.89,
            retrieval: 100,
            hallucination: 0,

            // Performance
            latency: 44.258,
            minLatency: 7.773,
            maxLatency: 119.731,

            promptTokens: 996.00,
            responseTokens: 88.56,
            totalTokens: 1084.56,

            timeoutRate: 10,

            // Docker
            cpu: "546.06%",
            memory: "672.9 MiB"
        },


        // ==================================================
        // GEMMA
        // ==================================================

        {
            name: "Gemma 3 270M",
            id: "gemma3:270m",

            // Quality
            questions: 10,
            accuracy: 50.00,
            relevance: 50.00,
            retrieval: 100,
            hallucination: 0,

            // Performance
            latency: 55.996,
            minLatency: 9.120,
            maxLatency: 150.733,

            promptTokens: 794.75,
            responseTokens: 12.62,
            totalTokens: 807.38,

            timeoutRate: 20,

            // Docker
            cpu: "251.02%",
            memory: "793.8 MiB"
        },


        // ==================================================
        // SMOLLM2
        // ==================================================

        {
            name: "SmolLM2 360M",
            id: "smollm2:360m",

            // Quality
            questions: 7,
            accuracy: 71.43,
            relevance: 85.71,
            retrieval: 100,
            hallucination: 28.57,

            // Performance
            latency: 69.413,
            minLatency: 3.967,
            maxLatency: 137.619,

            promptTokens: 1080.10,
            responseTokens: 102.50,
            totalTokens: 1182.60,

            timeoutRate: 0,

            // Docker
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
// BAR CREATION
// ======================================================

function createComparisonBars(
    metric,
    formatter,
    maxValue
) {

    const models =
        evaluationData.models;

    return models.map(
        model => {

            const value =
                Number(model[metric]) || 0;

            let width;

            if (maxValue) {

                width =
                    (value / maxValue) * 100;

            } else {

                const max =
                    Math.max(
                        ...models.map(
                            item =>
                                Number(item[metric]) || 0
                        )
                    );

                width =
                    max > 0
                        ? (value / max) * 100
                        : 0;
            }

            width =
                Math.min(
                    Math.max(width, 0),
                    100
                );

            return `
                <div class="comparison-model-row">

                    <div class="comparison-model-name">
                        ${model.name}
                    </div>

                    <div class="comparison-bar-container">

                        <div
                            class="comparison-bar ${getModelBarClass(model.id)}"
                            style="width:${width}%">
                        </div>

                    </div>

                    <div class="comparison-value">
                        ${formatter(value)}
                    </div>

                </div>
            `;
        }
    ).join("");
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


    const percentage =
        value =>
            `${Number(value).toFixed(2)}%`;

    const integer =
        value =>
            `${Math.round(value)}`;

    const seconds =
        value =>
            `${Number(value).toFixed(3)}s`;

    const number =
        value =>
            `${Number(value).toFixed(2)}`;



    /* ================================
   EVALUATION DATASET
================================ */

    const evaluationCategories = [
        {
            category: "Leave Policy",
            questions: 2
        },
        {
            category: "Work From Home",
            questions: 2
        },
        {
            category: "Organization",
            questions: 2
        },
        {
            category: "AI",
            questions: 2
        },
        {
            category: "Internships",
            questions: 2
        }
    ];

    const evaluationDatasetHTML = `
    <section class="evaluation-section dataset-section">

        <h2>Evaluation Dataset</h2>

        <p class="section-subtitle">
            10 representative questions used for evaluating all three models.
        </p>

        <div class="dataset-card">

            <div class="dataset-header">
                <span>Category</span>
                <span>Questions</span>
            </div>

            ${evaluationCategories.map(item => `
                <div class="dataset-row">
                    <span>${item.category}</span>
                    <strong>${item.questions}</strong>
                </div>
            `).join("")}

            <div class="dataset-total">
                <span>Total Questions</span>
                <strong>10</strong>
            </div>

        </div>

        <p class="dataset-note">
            The same questions were used across all three models under the same
            RAG evaluation setup.
        </p>

    </section>
`;


    // ================================================
    // QUALITY BARS
    // ================================================

    const accuracyBars =
        createComparisonBars(
            "accuracy",
            percentage,
            100
        );

    const relevanceBars =
        createComparisonBars(
            "relevance",
            percentage,
            100
        );

    const retrievalBars =
        createComparisonBars(
            "retrieval",
            percentage,
            100
        );


    // Hallucination:
    // Lower value is better, but bar represents
    // the actual hallucination percentage.

    const hallucinationBars =
        evaluationData.models.map(
            model => {

                const value =
                    Number(model.hallucination) || 0;

                return `
                    <div class="comparison-model-row">

                        <div class="comparison-model-name">
                            ${model.name}
                        </div>

                        <div class="comparison-bar-container">

                            <div
                                class="comparison-bar hallucination-bar"
                                style="width:${value}%">
                            </div>

                        </div>

                        <div class="comparison-value">
                            ${percentage(value)}
                        </div>

                    </div>
                `;
            }
        ).join("");


    const completedBars =
        createComparisonBars(
            "questions",
            integer,
            10
        );


    // ================================================
    // PERFORMANCE BARS
    // ================================================

    const latencyBars =
        createComparisonBars(
            "latency",
            seconds
        );

    const promptTokenBars =
        createComparisonBars(
            "promptTokens",
            number
        );

    const responseTokenBars =
        createComparisonBars(
            "responseTokens",
            number
        );

    const totalTokenBars =
        createComparisonBars(
            "totalTokens",
            number
        );


    // ================================================
    // CPU / MEMORY CARDS
    // ================================================

    const resourceCards =
        evaluationData.models.map(
            model => `

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

            `
        ).join("");


    // ================================================
    // LATENCY DETAILS
    // ================================================

    const latencyDetails =
        evaluationData.models.map(
            model => `

                <div class="latency-detail-row">

                    <div class="latency-model">
                        <strong>
                            ${model.name}
                        </strong>
                    </div>

                    <div>
                        <span>Min</span>
                        <strong>
                            ${seconds(model.minLatency)}
                        </strong>
                    </div>

                    <div>
                        <span>Average</span>
                        <strong>
                            ${seconds(model.latency)}
                        </strong>
                    </div>

                    <div>
                        <span>Max</span>
                        <strong>
                            ${seconds(model.maxLatency)}
                        </strong>
                    </div>

                </div>

            `
        ).join("");


    // ================================================
    // DASHBOARD HTML
    // ================================================

    dashboard.innerHTML = `
         ${evaluationDatasetHTML}

        <!-- ==========================================
             HEADER
        =========================================== -->

        <div class="evaluation-header">

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


        <!-- ==========================================
             OVERVIEW
        =========================================== -->

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
                    ${evaluationData.totalQuestions}
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
                    ${evaluationData.successfulResponses}
                </strong>

                <small>
                    ${(
            evaluationData.successfulResponses /
            evaluationData.totalQuestions *
            100
        ).toFixed(2)}% completed
                </small>

            </div>


            <div class="eval-stat-card">

                <span class="eval-stat-label">
                    Timeouts
                </span>

                <strong>
                    ${evaluationData.timeouts}
                </strong>

                <small>
                    ${(
            evaluationData.timeouts /
            evaluationData.totalQuestions *
            100
        ).toFixed(2)}% of planned runs
                </small>

            </div>

        </div>

        


        <!-- ==========================================
             QUALITY COMPARISON
        =========================================== -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Quality Comparison
                </h3>

                <p>
                    Results from the manual scoring sheet.
                </p>

            </div>


            <div class="comparison-card">


                <!-- ACCURACY -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Accuracy
                        </h3>

                        <p>
                            Percentage of factually correct answers.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${accuracyBars}
                    </div>

                </div>


                <!-- RELEVANCE -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Relevance
                        </h3>

                        <p>
                            Percentage of responses that directly
                            address the question.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${relevanceBars}
                    </div>

                </div>


                <!-- RETRIEVAL -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Retrieval Quality
                        </h3>

                        <p>
                            Percentage of questions where the
                            retrieved context contained the
                            required information.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${retrievalBars}
                    </div>

                </div>


                <!-- HALLUCINATION -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Hallucination Rate
                        </h3>

                        <p>
                            Percentage of responses containing
                            unsupported information. Lower is better.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${hallucinationBars}
                    </div>

                </div>


                <!-- COMPLETED QUESTIONS -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Completed Questions
                        </h3>

                        <p>
                            Number of successfully evaluated
                            questions for each model.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${completedBars}
                    </div>

                </div>

            </div>

        </section>


        <!-- ==========================================
             PERFORMANCE METRICS
        =========================================== -->

        <section class="evaluation-section">

            <div class="section-heading">

                <h3>
                    Performance Metrics
                </h3>

                <p>
                    Measured during the same RAG evaluation setup.
                </p>

            </div>


            <div class="comparison-card">


                <!-- AVERAGE LATENCY -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Average Response Latency
                        </h3>

                        <p>
                            Average time taken to return a response.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${latencyBars}
                    </div>

                </div>


                <!-- PROMPT TOKENS -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Average Prompt Tokens
                        </h3>

                        <p>
                            Average number of tokens supplied
                            to the model.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${promptTokenBars}
                    </div>

                </div>


                <!-- RESPONSE TOKENS -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Average Response Tokens
                        </h3>

                        <p>
                            Average number of generated tokens.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${responseTokenBars}
                    </div>

                </div>


                <!-- TOTAL TOKENS -->

                <div class="comparison-row">

                    <div class="comparison-description">

                        <h3>
                            Average Total Tokens
                        </h3>

                        <p>
                            Average prompt tokens plus response tokens.
                        </p>

                    </div>

                    <div class="comparison-bars">
                        ${totalTokenBars}
                    </div>

                </div>

            </div>

        </section>


        <!-- ==========================================
             CPU & MEMORY
        =========================================== -->

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

                ${resourceCards}

            </div>


            <p class="resource-note">

                CPU percentage can exceed 100% because Docker
                reports multi-core CPU utilization. These values
                represent observed resource usage during inference,
                not a controlled hardware benchmark.

            </p>

        </section>


        <!-- ==========================================
             LATENCY DETAILS
        =========================================== -->

<section class="evaluation-section">
    <h2>Latency Details</h2>
    <p class="section-subtitle">
        Minimum, average and maximum response times.
    </p>

    <div class="latency-comparison-card">

        ${evaluationData.models.map(model => {

            const maxLatency = Math.max(
                ...evaluationData.models.map(m => m.maxLatency)
            );

            const minWidth = (model.minLatency / maxLatency) * 100;
            const avgWidth = (model.latency / maxLatency) * 100;
            const maxWidth = (model.maxLatency / maxLatency) * 100;

            return `
                <div class="latency-model">

                    <div class="latency-model-name">
                        ${model.name}
                    </div>

                    <div class="latency-metric">
                        <div class="latency-label">
                            <span>Minimum</span>
                            <strong>${model.minLatency.toFixed(3)}s</strong>
                        </div>

                        <div class="latency-track">
                            <div
                                class="latency-bar"
                                style="width: ${minWidth}%;">
                            </div>
                        </div>
                    </div>

                    <div class="latency-metric">
                        <div class="latency-label">
                            <span>Average</span>
                            <strong>${model.latency.toFixed(3)}s</strong>
                        </div>

                        <div class="latency-track">
                            <div
                                class="latency-bar"
                                style="width: ${avgWidth}%;">
                            </div>
                        </div>
                    </div>

                    <div class="latency-metric">
                        <div class="latency-label">
                            <span>Maximum</span>
                            <strong>${model.maxLatency.toFixed(3)}s</strong>
                        </div>

                        <div class="latency-track">
                            <div
                                class="latency-bar"
                                style="width: ${maxWidth}%;">
                            </div>
                        </div>
                    </div>

                </div>
            `;
        }).join("")}

    </div>
</section>


        <!-- ==========================================
             METRIC DEFINITIONS
        =========================================== -->

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


        <!-- ==========================================
             EVALUATION STATUS
        =========================================== -->

        <section class="evaluation-note">

            <strong>
                Evaluation Status
            </strong>

            <p>
                30 model-question evaluations were planned.
                ${evaluationData.successfulResponses}
                responses completed successfully and
                ${evaluationData.timeouts}
                evaluations timed out. Timeout runs are reported
                separately and were not treated as incorrect answers.
            </p>

        </section>

    `;
}