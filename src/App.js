import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]); // Pour stocker les messages
  const [command, setCommand] = useState('');   // Pour stocker la commande de l'utilisateur
  const [isConnected, setIsConnected] = useState(false); // Pour vérifier l'état de connexion
  const ws = useRef(null); // On va utiliser useRef pour la connexion WebSocket
  console.log(messages)
  // Connecte au WebSocket à l'ouverture de l'application
  useEffect(() => {
    ws.current = new WebSocket('wss://8a36-2a01-cb05-9116-d800-1bc2-60bd-a1d1-9ac8.ngrok-free.app');
    // Quand la connexion est ouverte
    ws.current.onopen = () => {
      setIsConnected(true); // Mise à jour de l'état pour indiquer que la connexion est ouverte
    };
  
    // Quand un message est reçu depuis le serveur
    ws.current.onmessage = (event) => {
      // Vérifie si c'est un Blob (données binaires)
      if (event.data instanceof Blob) {
        // Si c'est un Blob, le convertir en texte
        const reader = new FileReader();
        reader.onload = function() {
          const textData = reader.result;
          setMessages((prevMessages) => [...prevMessages, textData]);
        };
        reader.readAsText(event.data); // Convertir le Blob en texte
      } else {
        // Si ce n'est pas un Blob, ajouter directement le message
        setMessages((prevMessages) => [...prevMessages, event.data]);
      }
    };
  
    // Si la connexion est fermée ou échoue
    ws.current.onclose = () => {
      setIsConnected(false);
    };
  
    // Fermer la connexion WebSocket quand le composant est démonté
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Fonction pour envoyer une commande au serveur
  const sendCommand = () => {
    if (command.trim() !== '' && isConnected && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(command);  // Envoie la commande au serveur
      setCommand('');  // Efface l'input après envoi
    } else {
      console.log("La connexion WebSocket n'est pas encore ouverte.");
    }
  };

  return (
    <div className="App">
      <h1>Real-time Command Interface</h1>

      <div id="console">
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>

      <input 
        type="text" 
        value={command} 
        onChange={(e) => setCommand(e.target.value)} 
        placeholder="Enter your command..."
        disabled={!isConnected} // Désactive l'input si la connexion n'est pas prête
      />
      <button onClick={sendCommand} disabled={!isConnected}>Submit</button>
      {!isConnected && <p>Connexion en cours...</p>}
    </div>
  );
}

export default App;
