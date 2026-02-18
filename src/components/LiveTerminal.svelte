<script>
  import { onDestroy, tick } from 'svelte';

  const API_BASE = 'https://veilspan.com/api';
  const WS_BASE = 'wss://veilspan.com/ws';
  const MAX_LINES = 500;

  let state = 'idle'; // idle | connecting | connected | disconnected | error
  let lines = [];
  let inputText = '';
  let history = [];
  let historyIndex = -1;
  let tempInput = '';
  let ws = null;
  let errorMessage = '';
  let outputEl;
  let inputEl;
  let lineCounter = 0;

  // ── Line classification (from TerminalXWidget.svelte) ──

  function classifyLine(text) {
    if (!text || !text.trim()) return '';
    const trimmed = text.trim();
    if (/^\[.+\]$/.test(trimmed)) return 'tx-bright';
    if (/^\+\s*\[/.test(trimmed)) return 'tx-cyan';
    if (trimmed.startsWith('- The visible exits')) return 'tx-cyan';
    if (/^Exits?:/i.test(trimmed)) return 'tx-cyan';
    if (trimmed.startsWith('- In the area:')) return 'tx-muted';
    if (trimmed === 'You look around ...') return 'tx-muted';
    if (trimmed.startsWith('Connected to')) return 'tx-muted';
    if (trimmed === 'Connection Closed.') return 'tx-muted';
    if (trimmed === 'reconnecting ...') return 'tx-muted';
    if (trimmed === 'Please log in to connect to the game.') return 'tx-amber';
    return '';
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderLine(text) {
    if (!text) return '\u00A0';
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<span class="tx-highlight">$1</span>');
    return html;
  }

  // ── Player colors (simplified from playerColors.js) ──

  const PLAYER_COLORS = [
    '#e06c75','#98c379','#e5c07b','#61afef','#c678dd',
    '#56b6c2','#d19a66','#ff6ac1','#a3be8c','#ebcb8b',
    '#88c0d0','#b48ead','#bf616a','#d08770','#5e81ac','#8fbcbb',
  ];

  function getPlayerColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = ((h << 5) - h + name.charCodeAt(i)) | 0;
    }
    return PLAYER_COLORS[((h % PLAYER_COLORS.length) + PLAYER_COLORS.length) % PLAYER_COLORS.length];
  }

  // ── Output management ──

  function addLine(text, cls = '') {
    lineCounter++;
    const autoClass = cls || classifyLine(text);
    lines.push({ html: renderLine(text), cls: autoClass, id: lineCounter });
    if (lines.length > MAX_LINES) {
      lines = lines.slice(lines.length - MAX_LINES);
    } else {
      lines = lines;
    }
    scrollToBottom();
  }

  function addPlayerMessage(username, message, color) {
    lineCounter++;
    const nameHtml = `<span class="tx-player-name" style="color:${escapeHtml(color)}">${escapeHtml(username)}</span>`;
    const msgHtml = renderLine(message);
    lines.push({ html: nameHtml + ':  ' + msgHtml, cls: '', id: lineCounter });
    if (lines.length > MAX_LINES) {
      lines = lines.slice(lines.length - MAX_LINES);
    } else {
      lines = lines;
    }
    scrollToBottom();
  }

  function renderMultiline(text) {
    const parts = String(text).split('\n');
    parts.forEach(part => addLine(part));
  }

  async function scrollToBottom() {
    await tick();
    if (outputEl) outputEl.scrollTop = outputEl.scrollHeight;
  }

  // ── Message handler (ported from Client.js) ──

  function handleServerMessage(msg) {
    switch (msg.type) {
      case 'enterRoom':
      case 'combatStart':
      case 'combatTurn':
      case 'combatAction':
      case 'combatStatus':
      case 'combatEnd':
      case 'characterSelected':
      case 'createCharacter':
      case 'questAccepted':
      case 'questProgress':
      case 'questCompleted':
        if (msg.message) renderMultiline(msg.message);
        break;

      case 'dialog': {
        let output = `[${msg.npcName}] ${msg.npcText}\n`;
        if (msg.options && msg.options.length > 0) {
          output += '\n';
          for (const opt of msg.options) {
            output += `${opt.index}. ${opt.text}\n`;
          }
          output += '\nEnter a number to respond:';
        }
        renderMultiline(output);
        break;
      }

      case 'dialogEnd': {
        let output = '';
        if (msg.username) output += `[${msg.username}] `;
        output += msg.message;
        output += '\n[The conversation has ended]';
        renderMultiline(output);
        break;
      }

      case 'inventoryUpdate':
      case 'characterUpdate':
      case 'roomUpdate':
      case 'questLog':
        break;

      default:
        if (msg.message === '' || msg.message === '\n') return;
        if (msg.username) {
          const color = getPlayerColor(msg.username);
          const parts = String(msg.message).split('\n');
          if (parts.length > 0) addPlayerMessage(msg.username, parts[0], color);
          for (let i = 1; i < parts.length; i++) addLine(parts[i]);
        } else if (msg.message) {
          renderMultiline(msg.message);
        }
        break;
    }
  }

  // ── Connection logic ──

  async function connect() {
    state = 'connecting';
    errorMessage = '';
    lines = [];
    lineCounter = 0;

    // Hide static terminal
    const staticEl = document.getElementById('static-terminal');
    if (staticEl) staticEl.style.display = 'none';

    try {
      addLine('Connecting to Veilspan...', 'tx-muted');

      const res = await fetch(`${API_BASE}/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server returned ${res.status}`);
      }

      const { token } = await res.json();

      addLine('Authenticating as guest...', 'tx-muted');

      ws = new WebSocket(`${WS_BASE}?access_token=${token}`);

      ws.addEventListener('open', () => {
        state = 'connected';
        addLine('Connected! Type "look" to begin exploring.', 'tx-muted');
        addLine('', '');
        requestAnimationFrame(() => { if (inputEl) inputEl.focus(); });
      });

      ws.addEventListener('message', (e) => {
        try {
          const msg = JSON.parse(e.data);
          handleServerMessage(msg);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      });

      ws.addEventListener('close', () => {
        if (state !== 'idle') {
          addLine('', '');
          addLine('Connection closed.', 'tx-muted');
          state = 'disconnected';
        }
      });

      ws.addEventListener('error', () => {
        if (state === 'connecting') {
          errorMessage = 'WebSocket connection failed';
          state = 'error';
          addLine(`Error: ${errorMessage}`, 'tx-amber');
        }
      });
    } catch (err) {
      errorMessage = err.message || 'Connection failed';
      state = 'error';
      addLine(`Error: ${errorMessage}`, 'tx-amber');
    }
  }

  function disconnect() {
    if (ws) {
      ws.close();
      ws = null;
    }
    state = 'idle';
    lines = [];
    lineCounter = 0;

    // Restore static terminal
    const staticEl = document.getElementById('static-terminal');
    if (staticEl) staticEl.style.display = '';
  }

  function sendCommand(cmd) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ message: cmd, type: 'message' }));
  }

  // ── Input handling (from TerminalXWidget) ──

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputText;
      if (cmd.trim()) {
        addLine('> ' + cmd, 'tx-cmd');
        history = [...history, cmd];
        historyIndex = -1;
        tempInput = '';
        sendCommand(cmd);
        scrollToBottom();
      }
      inputText = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        if (historyIndex === -1) {
          tempInput = inputText;
          historyIndex = history.length - 1;
        } else if (historyIndex > 0) {
          historyIndex--;
        }
        inputText = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputText = history[historyIndex];
        } else {
          historyIndex = -1;
          inputText = tempInput;
        }
      }
    }
  }

  function handleContainerClick() {
    if (inputEl) inputEl.focus();
  }

  onDestroy(() => {
    if (ws) ws.close();
  });
</script>

{#if state === 'idle'}
  <div class="live-cta">
    <button class="btn btn-primary live-btn" on:click={connect}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      Try it Live
    </button>
    <span class="live-hint">Connect as a guest to the Veilspan demo world</span>
  </div>
{:else}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="terminal live-terminal" on:click={handleContainerClick}>
    <div class="terminal-header">
      <span class="terminal-dot terminal-dot-red"></span>
      <span class="terminal-dot terminal-dot-yellow"></span>
      <span class="terminal-dot terminal-dot-green"></span>
      <span class="terminal-title">
        {#if state === 'connected'}
          veilspan.com — Live Session
        {:else if state === 'connecting'}
          Connecting...
        {:else}
          Disconnected
        {/if}
      </span>
      <button class="terminal-close-btn" on:click|stopPropagation={disconnect} title="Close">
        &times;
      </button>
    </div>

    <div class="terminal-output" bind:this={outputEl}>
      {#each lines as line (line.id)}
        <span class="tx-line {line.cls}">{@html line.html}</span>
      {/each}
    </div>

    {#if state === 'connected'}
      <div class="terminal-input-area">
        <span class="terminal-input-prompt">&gt;</span>
        <input
          type="text"
          class="terminal-input"
          bind:this={inputEl}
          bind:value={inputText}
          on:keydown={handleKeydown}
          placeholder="Type a command..."
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          inputmode="text"
          enterkeyhint="send"
        />
      </div>
    {/if}

    {#if state === 'disconnected' || state === 'error'}
      <div class="terminal-reconnect">
        <button class="btn btn-primary" on:click={connect}>Reconnect</button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .live-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .live-hint {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-text-dim);
  }

  .live-terminal {
    display: flex;
    flex-direction: column;
  }

  .terminal-output {
    max-height: 400px;
    min-height: 250px;
    overflow-y: auto;
    padding: 1rem 1.5rem;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    line-height: 1.6;

    scrollbar-width: thin;
    scrollbar-color: rgba(56, 189, 248, 0.2) transparent;
  }

  .terminal-output::-webkit-scrollbar {
    width: 6px;
  }

  .terminal-output::-webkit-scrollbar-track {
    background: transparent;
  }

  .terminal-output::-webkit-scrollbar-thumb {
    background: rgba(56, 189, 248, 0.2);
    border-radius: 3px;
  }

  /* Line rendering */
  .tx-line {
    display: block;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: var(--color-text);
  }

  .tx-cmd { color: #7ae8a4; }
  .tx-bright { color: #e8e6e3; font-weight: 500; }
  .tx-cyan { color: #8be9fd; }
  .tx-muted { color: #6b6660; }
  .tx-amber { color: #f0c674; }

  .tx-line :global(.tx-highlight) {
    color: #e8e6e3;
    font-weight: 500;
  }

  .tx-line :global(.tx-player-name) {
    font-weight: 500;
  }

  /* Input area */
  .terminal-input-area {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-top: 1px solid rgba(56, 189, 248, 0.1);
    background: #161622;
    flex-shrink: 0;
  }

  .terminal-input-prompt {
    color: var(--color-teal);
    margin-right: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    user-select: none;
  }

  .terminal-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #7ae8a4;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    line-height: 1.6;
    caret-color: var(--color-teal);
    padding: 0;
    margin: 0;
  }

  .terminal-input::placeholder {
    color: var(--color-text-dim);
  }

  /* Close button */
  .terminal-close-btn {
    background: none;
    border: none;
    color: var(--color-text-dim);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 0.25rem;
    line-height: 1;
    transition: color 0.2s;
    margin-left: auto;
  }

  .terminal-close-btn:hover {
    color: #ff5f57;
  }

  /* Reconnect bar */
  .terminal-reconnect {
    display: flex;
    justify-content: center;
    padding: 1rem;
    border-top: 1px solid rgba(56, 189, 248, 0.1);
  }
</style>
