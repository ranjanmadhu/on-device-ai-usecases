import { MediaPipeInferenceService } from './gen_ai_media_pipe/media-pipe.inference';
const mediaPipeInferenceService = new MediaPipeInferenceService();

// Loading popup elements
const loadingOverlay = document.getElementById('loadingOverlay') as HTMLElement;
const loadingMessage = document.getElementById('loadingMessage') as HTMLElement;
const loadingProgressBar = document.getElementById('loadingProgressBar') as HTMLElement;
const loadingCancelBtn = document.getElementById('loadingCancelBtn') as HTMLElement;

// Track if loading is in progress
let isModelLoading = false;

// Show the loading popup
function showLoadingPopup() {
  loadingOverlay.classList.add('visible');
  loadingProgressBar.classList.add('indeterminate');
  isModelLoading = true;
}

// Hide the loading popup
function hideLoadingPopup() {
  loadingOverlay.classList.remove('visible');
  isModelLoading = false;
}

// Update loading message
function updateLoadingMessage(message: string) {
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
}

// Handle model loading
async function initiateMediaPipeInference() {
  if (isModelLoading) return;
  
  const loadBtn = document.getElementById('loadModelBtn') as HTMLButtonElement;
  if (loadBtn) {
    loadBtn.disabled = true;
  }
  
  showLoadingPopup();
  updateLoadingMessage('Initializing AI model...');
  
  try {
    // Start the model initialization
    await mediaPipeInferenceService.initializeInference();
    
    // Update loading status
    updateLoadingMessage('Model loaded successfully!');
    loadingProgressBar.style.width = '100%';
    loadingProgressBar.classList.remove('indeterminate');
    
    // Wait a moment to show success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Enable chat interface
    enableChatInterface();
    
    // Update button state
    if (loadBtn) {
      loadBtn.textContent = 'Model Loaded';
      loadBtn.classList.add('loaded');
      loadBtn.disabled = true;
    }
    
    // Add a system message in the chat
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
      const systemMsg = document.createElement('div');
      systemMsg.className = 'message system';
      systemMsg.textContent = 'AI model loaded and ready to chat!';
      chatBox.appendChild(systemMsg);
    }
  } catch (error) {
    console.error('Failed to load model:', error);
    
    // Update loading status to show error
    updateLoadingMessage(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    loadingProgressBar.style.backgroundColor = '#f44336';
    loadingProgressBar.classList.remove('indeterminate');
    loadingProgressBar.style.width = '100%';
    
    // Wait a moment to show error message
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Re-enable the load button
    if (loadBtn) {
      loadBtn.disabled = false;
    }
    
    // Show error in chat
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'message error';
      errorMsg.textContent = 'Failed to load the AI model. Please try again.';
      chatBox.appendChild(errorMsg);
    }
  } finally {
    hideLoadingPopup();
  }
}

// Enable chat interface after model is loaded
function enableChatInterface() {
  const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
  if (sendBtn) {
    sendBtn.disabled = false;
  }
  
  const userInput = document.getElementById('userInput') as HTMLTextAreaElement;
  if (userInput) {
    userInput.disabled = false;
    userInput.placeholder = 'Type your message here...';
  }
}

function responseSetter() {
  const chatBox : any = document.getElementById('chatBox');
  if (!chatBox) return { set: () => {} };
  
  const botMessage = document.createElement('div');
  botMessage.className = 'message bot';
  chatBox.appendChild(botMessage);
  
  let value = '';
  function set(response: string) {
    value = response;
    botMessage.innerHTML = value;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  return { set };
}

function sendMessage(): void {
  const userInput = document.getElementById('userInput') as HTMLTextAreaElement;
  const chatBox = document.getElementById('chatBox');
  
  if (!userInput || !chatBox) return;

  const userInputText = userInput.value.trim();
  if (userInputText !== "") {
    // Disable input while processing
    userInput.disabled = true;
    const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
    if (sendBtn) {
      sendBtn.disabled = true;
    }
    
    // Append user message
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = userInputText;
    chatBox.appendChild(userMessage);

    // Show thinking indicator
    showProgressBar();
    
    // Get response from the model
    const responseHandler = responseSetter();
    mediaPipeInferenceService.generateResponse(userInputText, responseHandler.set)
      .then(() => {
        // Response completed successfully
        hideProgressBar();
        
        // Re-enable input after response is complete
        userInput.disabled = false;
        if (sendBtn) {
          sendBtn.disabled = false;
        }
        userInput.focus();
      })
      .catch(error => {
        hideProgressBar();
        
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message error';
        errorMsg.textContent = `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`;
        chatBox.appendChild(errorMsg);
        
        // Re-enable input
        userInput.disabled = false;
        if (sendBtn) {
          sendBtn.disabled = false;
        }
      });

    // Clear input
    userInput.value = '';
  }
}

// Progress bar functions
function showProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.classList.add('active');
  }
}

function hideProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.classList.remove('active');
  }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initially disable the chat input until model is loaded
  const userInput = document.getElementById('userInput') as HTMLTextAreaElement;
  if (userInput) {
    userInput.disabled = true;
    userInput.placeholder = 'Please load the model first...';
  }
  
  const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.addEventListener('click', sendMessage);
  }
  
  const loadModelBtn = document.getElementById('loadModelBtn') as HTMLButtonElement;
  if (loadModelBtn) {
    loadModelBtn.addEventListener('click', initiateMediaPipeInference);
  }
  
  // Add cancel button event listener
  if (loadingCancelBtn) {
    loadingCancelBtn.addEventListener('click', () => {
      hideLoadingPopup();
      const loadBtn = document.getElementById('loadModelBtn') as HTMLButtonElement;
      if (loadBtn) {
        loadBtn.disabled = false;
      }
    });
  }
  
  // Add keyboard event for sending messages with Enter key
  userInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
});