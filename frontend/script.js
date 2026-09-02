const API_URL = "http://10.0.2.15:8000";

const input = document.getElementById("questionInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");


// ===============================
// SET QUESTION
// ===============================

function setQuestion(question) {

    input.value = question;

    input.focus();
}


// ===============================
// ADD MESSAGE
// ===============================

function addMessage(message, type) {

    const wrapper = document.createElement("div");

    wrapper.className =
        type === "user"
            ? "message user-message"
            : "message assistant-message";


    const avatar = document.createElement("div");

    avatar.className = "avatar";

    avatar.textContent =
        type === "user"
            ? "👤"
            : "✦";


    const content = document.createElement("div");

    content.className = "message-content";


    const name = document.createElement("div");

    name.className = "message-name";

    name.textContent =
        type === "user"
            ? "You"
            : "PolicySphere AI";


    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.textContent = message;


    content.appendChild(name);

    content.appendChild(bubble);


    wrapper.appendChild(avatar);

    wrapper.appendChild(content);


    chatMessages.appendChild(wrapper);


    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ===============================
// LOADING MESSAGE
// ===============================

function showLoading() {

    const wrapper = document.createElement("div");

    wrapper.className = "message assistant-message";

    wrapper.id = "loadingMessage";


    wrapper.innerHTML = `
        <div class="avatar">✦</div>

        <div class="message-content">

            <div class="message-name">
                PolicySphere AI
            </div>

            <div class="bubble">

                <div class="loading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>

        </div>
    `;


    chatMessages.appendChild(wrapper);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ===============================
// REMOVE LOADING
// ===============================

function removeLoading() {

    const loading = document.getElementById("loadingMessage");

    if (loading) {
        loading.remove();
    }
}


// ===============================
// ASK QUESTION
// ===============================

async function askQuestion() {

    const question = input.value.trim();


    if (!question) {
        return;
    }


    // Show user message

    addMessage(question, "user");


    // Clear input

    input.value = "";


    // Disable button

    sendButton.disabled = true;


    // Show loading

    showLoading();


    try {

        const response = await fetch(`${API_URL}/ask`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question
            })

        });


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        const data = await response.json();


        removeLoading();


        // Display answer

        addMessage(
            data.answer || "No answer received.",
            "assistant"
        );


    }

    catch (error) {

        removeLoading();

        console.error(error);


        addMessage(
            "I could not connect to the application service. Please make sure the Docker services are running.",
            "assistant"
        );

    }

    finally {

        sendButton.disabled = false;

        input.focus();

    }

}


// ===============================
// ENTER TO SEND
// ===============================

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        askQuestion();

    }

});
