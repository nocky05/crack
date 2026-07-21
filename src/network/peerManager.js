import Peer from 'peerjs';

class PeerManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.peerId = null;
    this.isHost = false;
    this.listeners = new Map();
  }

  // S'abonner aux événements
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Émettre un événement interne
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  // 1. Initialiser en tant qu'Hôte (Joueur 1)
  initHost() {
    return new Promise((resolve, reject) => {
      this.isHost = true;
      const customPrefix = 'crack-bereen-' + Math.random().toString(36).substring(2, 8);
      
      this.peer = new Peer(customPrefix, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('✅ Hôte P2P prêt avec ID:', id);
        resolve(id);
      });

      this.peer.on('connection', (connection) => {
        console.log('🤝 Invité connecté à l\'hôte!');
        this.conn = connection;
        this.setupConnectionListeners();
        this.emit('connected', { isHost: true, peerId: connection.peer });
      });

      this.peer.on('error', (err) => {
        console.error('❌ Erreur PeerJS Hôte:', err);
        this.emit('error', err);
        reject(err);
      });
    });
  }

  // 2. Initialiser et rejoindre en tant qu'Invité (Joueur 2)
  connectToHost(hostId) {
    return new Promise((resolve, reject) => {
      this.isHost = false;
      const guestPrefix = 'crack-bereen-' + Math.random().toString(36).substring(2, 8);

      this.peer = new Peer(guestPrefix, {
        debug: 1
      });

      this.peer.on('open', (id) => {
        this.peerId = id;
        console.log('✅ Invité P2P initialisé avec ID:', id);
        
        // Se connecter à l'hôte
        this.conn = this.peer.connect(hostId, {
          reliable: true
        });

        this.conn.on('open', () => {
          console.log('🤝 Connexion P2P établie avec l\'hôte!');
          this.setupConnectionListeners();
          this.emit('connected', { isHost: false, hostId });
          resolve();
        });

        this.conn.on('error', (err) => {
          console.error('❌ Erreur de connexion P2P:', err);
          this.emit('error', err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        console.error('❌ Erreur PeerJS Invité:', err);
        this.emit('error', err);
        reject(err);
      });
    });
  }

  // Configuration des écouteurs sur le canal de données
  setupConnectionListeners() {
    if (!this.conn) return;

    this.conn.on('data', (data) => {
      console.log('📩 Message P2P reçu:', data.type, data.payload);
      this.emit(data.type, data.payload);
    });

    this.conn.on('close', () => {
      console.warn('⚠️ Connexion P2P fermée');
      this.emit('disconnected', {});
    });

    this.conn.on('error', (err) => {
      console.error('❌ Erreur canal P2P:', err);
      this.emit('error', err);
    });
  }

  // Envoyer des données P2P
  send(type, payload = {}) {
    if (this.conn && this.conn.open) {
      this.conn.send({ type, payload });
    } else {
      console.warn('⚠️ Impossible d\'envoyer le message P2P: Connexion non ouverte');
    }
  }

  // Obtenir le lien d'invitation à partager
  getShareableLink() {
    if (!this.peerId) return '';
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?join=${this.peerId}`;
  }

  // Nettoyer la connexion
  disconnect() {
    if (this.conn) {
      this.conn.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.peer = null;
    this.conn = null;
    this.peerId = null;
    this.listeners.clear();
  }
}

// Export singleton instance
export const peerManager = new PeerManager();
