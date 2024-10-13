import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]); // For storing messages
  const [command, setCommand] = useState(""); // For storing user command
  const [isConnected, setIsConnected] = useState(false); // To check connection status
  const [animatedMessages, setAnimatedMessages] = useState([]); // Messages with animation
  const ws = useRef(null); // We'll use useRef for WebSocket connection

  // Function to generate random characters for the animation
  const generateRandomString = (length) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  // Function to animate text display
  const animateText = (text, index) => {
    const delay = 50; // Adjust speed of animation
    const characters = text.split("");
    let currentIndex = 0;

    const interval = setInterval(() => {
      setAnimatedMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[index] =
          text.slice(0,currentIndex) + generateRandomString(text.length - currentIndex);

        return updatedMessages;
      });
      currentIndex++;
      if (currentIndex > characters.length) {
        clearInterval(interval);
      }
    }, delay);
  };

  // WebSocket connection logic
  useEffect(() => {
    ws.current = new WebSocket(
      "wss://8a36-2a01-cb05-9116-d800-1bc2-60bd-a1d1-9ac8.ngrok-free.app"
    );

    // When the connection is open
    ws.current.onopen = () => {
      setIsConnected(true); // Update state to indicate that connection is open
    };

    // When a message is received from the server
    ws.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // Si c'est un Blob, le convertir en texte
        const reader = new FileReader();
        reader.onload = function () {
          const textData = reader.result;
          setMessages((prevMessages) => [...prevMessages, textData]);
        };
        reader.readAsText(event.data); // Convertir le Blob en texte
      } else {
        // Si ce n'est pas un Blob, ajouter directement le message
        setMessages((prevMessages) => [...prevMessages, event.data]);
      }
    };

    // If the connection is closed or fails
    ws.current.onclose = () => {
      setIsConnected(false);
    };

    // Close WebSocket when component is unmounted
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Animate the latest message when the `messages` array is updated
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessageIndex = messages.length - 1;
      let randomChar = generateRandomString(
        messages[latestMessageIndex].length
      );
      setAnimatedMessages((prevMessages) => [...prevMessages, randomChar]);
      animateText(messages[latestMessageIndex], latestMessageIndex);
    }
  }, [messages]);

  // Function to send a command to the server
  const sendCommand = () => {
    if (
      command.trim() !== "" &&
      isConnected &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      ws.current.send(command); // Send command to server
      setCommand(""); // Clear input after sending
    } else {
      console.log("The WebSocket connection is not open yet.");
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && isConnected) {
      sendCommand()
    }
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', height: '100vh', padding: '20px' }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          textAlign: "center", // Ensure the text is centered
          fontFamily: "light",
        }}
      >
        * plaid'o1e *
      </div>

      <div id="console">
        {animatedMessages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      <input
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '10px',
          border: '2px solid #555',
          borderRadius: '5px',
          width: '100%',
        }}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyPress} // Handle key press event
        placeholder="Enter your command..."
        disabled={!isConnected} // Disable input if connection is not ready
      />
      {!isConnected && <p style={{ color: 'orange' }}>Connecting...</p>}
    </div>
  );
}

export default App;
