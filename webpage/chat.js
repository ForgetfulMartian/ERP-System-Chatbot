// Function to display messages in the chatbox
function displayMessage(message, sender) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');

    // Set class based on sender type
    if (sender === 'user') {
        messageElement.className = 'message user-message'; // Class for user message
    } else if (sender === 'bot') {
        messageElement.className = 'message bot-message'; // Class for bot message
    }
    
    messageElement.textContent = message; // Set the text of the message
    chatbox.appendChild(messageElement); // Add message to the chatbox

    // Scroll to the bottom of the chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Event listener for the send button
document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input'); // Get user input element
    const userMessage = userInput.value; // Get user input value
    
    if (userMessage.trim() === '') return; // Prevent sending empty messages

    displayMessage(userMessage, 'user'); // Display the user's message

    // Send the user message to the RASA server
    fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender: 'user', // Identifier for the sender
            message: userMessage // The user's message
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
    })
    .then(data => {
        if (Array.isArray(data)) {
            data.forEach(message => {
                if (message.text) { // Check if there's a text property
                    displayMessage(message.text, 'bot'); // Display the bot's message
                } else {
                    console.error('Unexpected message format:', message);
                }
            });
        } else {
            console.error('Expected an array but got:', data);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        displayMessage('Error connecting to RASA server.', 'bot'); // Handle errors
    });

    // Clear the input field
    userInput.value = ''; // Clear the input field after sending
});

