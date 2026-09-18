// ==========================================
// ORGMIND - WEEK 4 EVALUATION DASHBOARD
// ==========================================

const evaluationData = {
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
            cpu: "Observed: 5468.83%",
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
            cpu: "Observed: 251.02%",
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
            cpu: "Observed: 409.74%",
            memory: "1.113 GiB"
        }
    ],

    totalQuestions: 30,
    successfulQuestions: 26,
    timeouts: 4
};


// ==========================================
// DASHBOARD HTML
// ==========================================

function renderEvaluationDashboard() {

    const dashboard = document.getElementById("evaluationDashboard");

    if (!dashboard) {
        console.error("Evaluation dashboard container not found.");
        return;
    }

    dashboard.innerHTML = `

        <div class="evaluation-header">
            <div>
                <span class="evaluation-label">WEEK 4</span>
                <h1>Model Evaluation Dashboard</h1>
                <p>
                    Quantitative evaluation of OrgMind using three locally
                    hosted LLM models under the same RAG pipeline.
                </p>
            </div>
        </div>


        <!-- OVERVIEW CARDS -->

        <div class="evaluation-overview">

            <div class="eval-stat-card">
                <span class="eval-stat-label">Models Tested</span>
                <strong>3</strong>
                <small>Local LLM models</small>
            </div>

            <div class="eval-stat-card">
                <span class="eval-stat-label">Evaluation Questions</span>
                <strong>30</strong>
                <small>10 questions per model</small>
            </div>

            <div class="eval-stat-card">
                <span class="eval-stat-label">Successful Responses</span>
                <strong>26</strong>
                <small>86.67% completed</small>
            </div>

            <div class="eval-stat-card">
                <span class="eval-stat-label">Timeouts</span>
                <strong>4</strong>
                <small>13.33% of evaluations</small>
            </div>

        </div>


        <!-- MODEL CARDS -->

        <section class="evaluation-section">

            <div class="section-heading">
                <h2>Model Performance</h2>
                <p>Quality and efficiency metrics for each evaluated model.</p>
            </div>

            <div class="model-cards">

                ${evaluationData.models.map(model => `

                    <div class="model-card">

                        <div class="model-card-header">
                            <div>
                                <h3>${model.name}</h3>
                                <span>${model.id}</span>
                            </div>

                            <div class="question-count">
                                ${model.questions}/10
                                <small>completed</small>
                            </div>
                        </div>


                        <div class="metric-group">

                            <div class="metric-row">
                                <span>Accuracy</span>
                                <strong>${model.accuracy}%</strong>
                            </div>

                            <div class="metric-bar">
                                <div style="width:${model.accuracy}%"></div>
                            </div>


                            <div class="metric-row">
                                <span>Relevance</span>
                                <strong>${model.relevance}%</strong>
                            </div>

                            <div class="metric-bar">
                                <div style="width:${model.relevance}%"></div>
                            </div>


                            <div class="metric-row">
                                <span>Retrieval Quality</span>
                                <strong>${model.retrieval}%</strong>
                            </div>

                            <div class="metric-bar">
                                <div style="width:${model.retrieval}%"></div>
                            </div>


                            <div class="metric-row">
                                <span>Hallucination Rate</span>
                                <strong>${model.hallucination}%</strong>
                            </div>

                            <div class="metric-bar danger-bar">
                                <div style="width:${model.hallucination}%"></div>
                            </div>

                        </div>

                    </div>

                `).join("")}

            </div>

        </section>


        <!-- COMPARISON TABLE -->

        <section class="evaluation-section">

            <div class="section-heading">
                <h2>Quality Comparison</h2>
                <p>Manual evaluation of successful model responses.</p>
            </div>

            <div class="evaluation-table-wrapper">

                <table class="evaluation-table">

                    <thead>
                        <tr>
                            <th>Metric</th>
                            ${evaluationData.models.map(m => `<th>${m.name}</th>`).join("")}
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Questions Evaluated</td>
                            ${evaluationData.models.map(m => `<td>${m.questions}</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Accuracy</td>
                            ${evaluationData.models.map(m => `<td>${m.accuracy}%</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Relevance</td>
                            ${evaluationData.models.map(m => `<td>${m.relevance}%</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Retrieval Quality</td>
                            ${evaluationData.models.map(m => `<td>${m.retrieval}%</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Hallucination Rate</td>
                            ${evaluationData.models.map(m => `<td>${m.hallucination}%</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Test-Pass Rate</td>
                            ${evaluationData.models.map(() => `<td>N/A</td>`).join("")}
                        </tr>

                    </tbody>

                </table>

            </div>

        </section>


        <!-- PERFORMANCE TABLE -->

        <section class="evaluation-section">

            <div class="section-heading">
                <h2>Performance Metrics</h2>
                <p>Latency and token consumption measured during evaluation.</p>
            </div>

            <div class="evaluation-table-wrapper">

                <table class="evaluation-table">

                    <thead>
                        <tr>
                            <th>Metric</th>
                            ${evaluationData.models.map(m => `<th>${m.name}</th>`).join("")}
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Average Latency</td>
                            ${evaluationData.models.map(m => `<td>${m.latency}s</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Minimum Latency</td>
                            <td>7.773s</td>
                            <td>7.850s</td>
                            <td>17.430s</td>
                        </tr>

                        <tr>
                            <td>Maximum Latency</td>
                            <td>119.731s</td>
                            <td>41.495s</td>
                            <td>137.619s</td>
                        </tr>

                        <tr>
                            <td>Avg Prompt Tokens</td>
                            ${evaluationData.models.map(m => `<td>${m.promptTokens}</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Avg Response Tokens</td>
                            ${evaluationData.models.map(m => `<td>${m.responseTokens}</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Avg Total Tokens</td>
                            ${evaluationData.models.map(m => `<td>${m.totalTokens}</td>`).join("")}
                        </tr>

                        <tr>
                            <td>Timeout Rate</td>
                            ${evaluationData.models.map(m => `<td>${m.timeoutRate}%</td>`).join("")}
                        </tr>

                    </tbody>

                </table>

            </div>

        </section>


        <!-- RESOURCE CONSUMPTION -->

        <section class="evaluation-section">

            <div class="section-heading">
                <h2>Resource Consumption</h2>
                <p>Observed Docker resource usage during model inference.</p>
            </div>

            <div class="resource-grid">

                ${evaluationData.models.map(model => `

                    <div class="resource-card">

                        <h3>${model.name}</h3>

                        <div class="resource-item">
                            <span>CPU</span>
                            <strong>${model.cpu}</strong>
                        </div>

                        <div class="resource-item">
                            <span>Memory</span>
                            <strong>${model.memory}</strong>
                        </div>

                    </div>

                `).join("")}

            </div>

            <p class="resource-note">
                CPU and memory values are observed Docker statistics during
                inference on the Ubuntu VM. CPU percentage may exceed 100%
                because Docker reports multi-core CPU utilization.
            </p>

        </section>


        <!-- LATENCY CHART -->

        <section class="evaluation-section">

            <div class="section-heading">
                <h2>Average Response Latency</h2>
                <p>Lower latency indicates faster response generation.</p>
            </div>

            <div class="chart-container">

                ${evaluationData.models.map(model => {

                    const maxLatency = 80;
                    const width = Math.min((model.latency / maxLatency) * 100, 100);

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


        <!-- METHODOLOGY -->

        <section class="evaluation-section methodology-section">

            <div class="section-heading">
                <h2>Evaluation Methodology</h2>
                <p>How each metric was calculated.</p>
            </div>

            <div class="methodology-grid">

                <div class="method-card">
                    <h3>Accuracy</h3>
                    <p>
                        Correct answers divided by successfully evaluated
                        questions, multiplied by 100.
                    </p>
                </div>

                <div class="method-card">
                    <h3>Relevance</h3>
                    <p>
                        Responses that directly addressed the user's question
                        divided by successful responses, multiplied by 100.
                    </p>
                </div>

                <div class="method-card">
                    <h3>Retrieval Quality</h3>
                    <p>
                        Responses where the retrieved context contained the
                        required information divided by evaluated responses.
                    </p>
                </div>

                <div class="method-card">
                    <h3>Hallucination Rate</h3>
                    <p>
                        Responses containing unsupported or invented information
                        divided by evaluated responses, multiplied by 100.
                    </p>
                </div>

                <div class="method-card">
                    <h3>Response Latency</h3>
                    <p>
                        Time measured from sending the question to receiving
                        the application's response.
                    </p>
                </div>

                <div class="method-card">
                    <h3>Token Usage</h3>
                    <p>
                        Prompt tokens plus generated response tokens.
                        Average token usage was calculated for each model.
                    </p>
                </div>

                <div class="method-card">
                    <h3>CPU / Memory</h3>
                    <p>
                        Docker resource statistics were observed during
                        model inference and peak/observed usage recorded.
                    </p>
                </div>

                <div class="method-card">
                    <h3>Test-Pass Rate</h3>
                    <p>
                        Not applicable because OrgMind generates natural-language
                        policy responses rather than executable code.
                    </p>
                </div>

            </div>

        </section>


        <!-- EVALUATION NOTE -->

        <section class="evaluation-note">

            <strong>Evaluation Note</strong>

            <p>
                30 model-question evaluations were planned. 26 responses
                completed successfully while 4 evaluations timed out.
                Timeouts were reported separately and were not treated as
                incorrect answers.
            </p>

        </section>

    `;
}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    renderEvaluationDashboard();
});