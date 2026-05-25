import mqtt from 'mqtt';

// ── Config ────────────────────────────────────────────────
const BROKER_URL    = 'ws://localhost:9001';
const SUBSCRIPTIONS = ['farm/+/data', 'farm/+/alerts'];

const OPTIONS = {
  clientId:         `educfarm_${Math.random().toString(16).slice(2, 10)}`,
  clean:            true,
  reconnectPeriod:  3000,   // ms between reconnect attempts
  connectTimeout:   10000,  // ms before giving up on a single attempt
  keepalive:        60,
  will: {
    topic:   'farm/clients/status',
    payload: 'offline',
    qos:     1,
    retain:  false,
  },
};

// ── Listeners registry ────────────────────────────────────
// Keyed by event: 'connect' | 'reconnect' | 'disconnect' | 'error' | 'message'
const listeners = { connect: [], reconnect: [], disconnect: [], error: [], message: [] };

function emit(event, ...args) {
  listeners[event]?.forEach((fn) => fn(...args));
}

// ── Client ────────────────────────────────────────────────
const client = mqtt.connect(BROKER_URL, OPTIONS);

client.on('connect', () => {
  console.info('[MQTT] Connected to', BROKER_URL);

  client.subscribe(SUBSCRIPTIONS, { qos: 1 }, (err, granted) => {
    if (err) {
      console.error('[MQTT] Subscription error:', err.message);
      return;
    }
    granted.forEach(({ topic, qos }) =>
      console.info(`[MQTT] Subscribed → ${topic} (QoS ${qos})`)
    );
  });

  emit('connect');
});

client.on('reconnect', () => {
  console.info('[MQTT] Reconnecting…');
  emit('reconnect');
});

client.on('disconnect', (packet) => {
  console.warn('[MQTT] Disconnected', packet);
  emit('disconnect', packet);
});

client.on('offline', () => {
  console.warn('[MQTT] Client offline — broker unreachable');
  emit('disconnect', { reasonCode: 'offline' });
});

client.on('error', (err) => {
  console.error('[MQTT] Error:', err.message);
  emit('error', err);
});

client.on('message', (topic, payload) => {
  let parsed;
  try {
    parsed = JSON.parse(payload.toString());
  } catch {
    parsed = payload.toString();
  }
  emit('message', topic, parsed);
});

// ── Public API ────────────────────────────────────────────

/**
 * Register a listener for an MQTT lifecycle event.
 *
 * Events:
 *   'connect'    — broker connected
 *   'reconnect'  — attempting reconnect
 *   'disconnect' — broker disconnected
 *   'error'      — connection/protocol error
 *   'message'    — (topic: string, payload: object|string)
 *
 * Returns an unsubscribe function.
 */
function on(event, fn) {
  if (!listeners[event]) {
    console.warn(`[MQTT] Unknown event: "${event}"`);
    return () => {};
  }
  listeners[event].push(fn);
  return () => {
    listeners[event] = listeners[event].filter((f) => f !== fn);
  };
}

/**
 * Publish a message to a topic.
 * @param {string} topic
 * @param {object|string} payload  — objects are JSON-serialised automatically
 * @param {object} [opts]          — mqtt publish options (qos, retain, …)
 */
function publish(topic, payload, opts = { qos: 1 }) {
  const message = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
  client.publish(topic, message, opts, (err) => {
    if (err) console.error(`[MQTT] Publish failed on "${topic}":`, err.message);
  });
}

/** Gracefully disconnect the client. */
function disconnect() {
  client.end(false, {}, () => console.info('[MQTT] Client disconnected gracefully'));
}

/** True when the client has an active broker connection. */
function isConnected() {
  return client.connected;
}

export default { on, publish, disconnect, isConnected };
