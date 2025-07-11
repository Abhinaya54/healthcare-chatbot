document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const historyList = document.getElementById("history");
    const clearAllBtn = document.getElementById("clear-history");
    const newChatBtn = document.getElementById("new-chat-btn");
    const themeToggleBtn = document.getElementById("theme-toggle"); // Get theme toggle button
    const themeToggleIcon = themeToggleBtn.querySelector('i'); // Get icon inside the button

    // Get or generate a unique session ID for this tab instance.
    // This ensures separate conversations in different tabs/windows.
    let currentSessionId = sessionStorage.getItem('healthChatSessionId');
    if (!currentSessionId) {
        currentSessionId = uuidv4();
        sessionStorage.setItem('healthChatSessionId', currentSessionId);
    }

    loadHistory(); // Load the list of chat sessions

    // Theme logic
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleIcon.classList.remove('fa-moon');
            themeToggleIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleIcon.classList.remove('fa-sun');
            themeToggleIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    }

    // Apply theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Default to system preference if no theme saved
        applyTheme('dark');
    } else {
        applyTheme('light'); // Default to light mode
    }

    // Theme toggle button event listener
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            applyTheme('light');
        } else {
            applyTheme('dark');
        }
    });


    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message === "") return;

        addMessage("user", message);
        input.value = "";

        const typingIndicator = addTypingIndicator(); // Show typing indicator

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Include the current session_id in the request body
                body: JSON.stringify({ message: message, session_id: currentSessionId }),
            });
            const data = await response.json();

            removeTypingIndicator(typingIndicator); // Remove typing indicator
            addMessage("bot", data.reply);
            
            loadHistory(); // Reload the history list after a new message is saved
        } catch (err) {
            removeTypingIndicator(typingIndicator);
            addMessage("bot", "Error: Could not reach server.");
            console.error("Chat submission error:", err);
        }
    });

    // Function to add chat message to the chat box
    function addMessage(sender, text) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("chat-message", sender);
        // Add specific class for bot messages, to distinguish from initial greeting
        if (sender === "bot") {
            msgDiv.classList.add("dynamic-bot-message");
            // Use marked.parse() to convert Markdown to HTML for bot replies
            msgDiv.innerHTML = marked.parse(text); // <--- IMPORTANT CHANGE HERE
        } else {
            msgDiv.textContent = text; // User messages are plain text
        }
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
    }

    // Function to add a "Typing..." indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("chat-message", "bot", "typing");
        typingDiv.textContent = "Typing...";
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return typingDiv;
    }

    // Function to remove the "Typing..." indicator
    function removeTypingIndicator(typingElem) {
        if (typingElem && chatBox.contains(typingElem)) {
            chatBox.removeChild(typingElem);
        }
    }

    // Load chat history list from backend (shows the last message of each session)
    async function loadHistory() {
        try {
            const res = await fetch("/history");
            const data = await res.json();
            historyList.innerHTML = ""; // Clear existing history

            data.history.forEach(chat => {
                const li = document.createElement("li");
                
                const textSpan = document.createElement("span");
                // Displaying the user's last message for the session in history
                textSpan.textContent = chat.user; 
                textSpan.title = `Last message: ${chat.timestamp}`; // Show timestamp on hover
                textSpan.classList.add("history-item-text");

                // Event listener to load the full conversation of a selected session
                textSpan.addEventListener("click", async (e) => {
                    e.preventDefault();
                    // Set the current session ID to the selected chat's session ID
                    currentSessionId = chat.session_id;
                    sessionStorage.setItem('healthChatSessionId', currentSessionId);
                    await displayChatConversation(chat.session_id);
                    input.focus(); // Focus on input after loading conversation
                });
                
                const deleteBtn = document.createElement("button");
                deleteBtn.classList.add("delete-history-item");
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome trash icon
                deleteBtn.title = "Delete this chat session";
                deleteBtn.addEventListener("click", async (e) => {
                    e.stopPropagation(); // Prevent the li click event from firing
                    // Use the chat.id to identify which session to delete
                    await deleteChatItem(chat.id);
                });

                li.appendChild(textSpan);
                li.appendChild(deleteBtn);
                historyList.appendChild(li);
            });
        } catch (err) {
            console.error("Error loading history:", err);
        }
    }

    // Function to fetch and display a specific chat conversation (entire session)
    async function displayChatConversation(sessionId) {
        try {
            const res = await fetch(`/get_session_conversation/${sessionId}`);
            const data = await res.json();

            if (data.conversation && data.conversation.length > 0) {
                chatBox.innerHTML = ""; // Clear current chat box
                data.conversation.forEach(msg => {
                    addMessage("user", msg.user);
                    // Ensure bot messages from history are also parsed as Markdown
                    addMessage("bot", msg.bot); 
                });
            } else {
                console.error("Error: Conversation data not found or incomplete for session ID:", sessionId);
                chatBox.innerHTML = "";
                // If no conversation found, still show initial greeting for new interaction
                const initialGreeting = document.createElement("div");
                initialGreeting.classList.add("chat-message", "bot", "initial-greeting");
                initialGreeting.textContent = "No conversation found for this session. Start a new one! 🩹"; // Emoji added
                chatBox.appendChild(initialGreeting);
            }
        } catch (err) {
            console.error("Error displaying chat conversation:", err);
            chatBox.innerHTML = "";
            const errorGreeting = document.createElement("div");
            errorGreeting.classList.add("chat-message", "bot", "initial-greeting");
            errorGreeting.textContent = "Error: Could not retrieve this conversation. Please try again. 😕";
            chatBox.appendChild(errorGreeting);
        }
    }

    // Function to delete a single chat item (which now deletes the whole session in backend)
    async function deleteChatItem(chatId) {
        if (confirm("Are you sure you want to delete this chat session?")) {
            try {
                const res = await fetch(`/delete_chat/${chatId}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    loadHistory(); // Reload history after deletion
                    chatBox.innerHTML = ""; // Clear current chat display
                    const initialGreeting = document.createElement("div");
                    initialGreeting.classList.add("chat-message", "bot", "initial-greeting");
                    initialGreeting.textContent = "Chat session deleted. Start a new conversation! 👋";
                    chatBox.appendChild(initialGreeting);
                    // If the deleted session was the current one, start a new session
                    currentSessionId = uuidv4();
                    sessionStorage.setItem('healthChatSessionId', currentSessionId);
                } else {
                    console.error("Failed to delete chat item.");
                    alert("Failed to delete chat session.");
                }
            } catch (err) {
                console.error("Error deleting chat item:", err);
                alert("Error deleting chat session.");
            }
        }
    }

    // Event listener for the "New Chat" button
    newChatBtn?.addEventListener("click", () => {
        chatBox.innerHTML = ""; // Clear current chat display
        input.value = ""; // Clear input field
        const initialGreeting = document.createElement("div");
        initialGreeting.classList.add("chat-message", "bot", "initial-greeting");
        initialGreeting.textContent = "Hello! I'm your health assistant. How can I help you today? 🩺"; // Emoji added
        chatBox.appendChild(initialGreeting);
        
        // Generate a brand new session ID for the new chat
        currentSessionId = uuidv4();
        sessionStorage.setItem('healthChatSessionId', currentSessionId);
        input.focus(); // Focus on input field
    });

    // Event listener for the "Clear All" history button
    clearAllBtn?.addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear ALL chat history? This action cannot be undone. ⚠️")) {
            try {
                const res = await fetch("/clear_history", { method: "POST" });
                if (res.ok) {
                    historyList.innerHTML = ""; // Clear history list display
                    chatBox.innerHTML = ""; // Clear current chat display
                    const initialGreeting = document.createElement("div");
                    initialGreeting.classList.add("chat-message", "bot", "initial-greeting");
                    initialGreeting.textContent = "All chat history cleared! Ready for a fresh start. 🎉";
                    chatBox.appendChild(initialGreeting);
                    input.value = ""; // Clear input field
                    // Generate a new session ID after clearing all history
                    currentSessionId = uuidv4();
                    sessionStorage.setItem('healthChatSessionId', currentSessionId);
                } else {
                    console.error("Failed to clear all history.");
                    alert("Failed to clear all chat history.");
                }
            } catch (err) {
                console.error("Error clearing all history:", err);
                alert("Error clearing all chat history.");
            }
        }
    });

    // Helper function to generate UUIDs (Universally Unique Identifiers)
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
});