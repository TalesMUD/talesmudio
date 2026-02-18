// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://talesmud.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    svelte(),
    starlight({
      title: 'TalesMUD',
      description: 'An open-source framework for building browser-based Multi-User Dungeons. Go backend, Svelte frontend, zero telnet required.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/TalesMUD/talesmud' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'docs/getting-started/introduction' },
            { label: 'Installation', slug: 'docs/getting-started/installation' },
            { label: 'Quick Start', slug: 'docs/getting-started/quick-start' },
            { label: 'Configuration', slug: 'docs/getting-started/configuration' },
            { label: 'Your First World', slug: 'docs/getting-started/first-world' },
          ],
        },
        {
          label: 'Core Concepts',
          items: [
            { label: 'Architecture Overview', slug: 'docs/core-concepts/architecture' },
            { label: 'The Game Loop', slug: 'docs/core-concepts/game-loop' },
            { label: 'Message System', slug: 'docs/core-concepts/message-system' },
            { label: 'Rooms & Zones', slug: 'docs/core-concepts/rooms-and-zones' },
            { label: 'Characters & Classes', slug: 'docs/core-concepts/characters' },
            { label: 'Data Storage', slug: 'docs/core-concepts/data-storage' },
          ],
        },
        {
          label: 'World Building',
          items: [
            { label: 'Creating Rooms', slug: 'docs/world-building/creating-rooms' },
            { label: 'Building Zones', slug: 'docs/world-building/building-zones' },
            { label: 'NPCs & Spawners', slug: 'docs/world-building/npcs-and-spawners' },
            { label: 'Dialog Trees', slug: 'docs/world-building/dialog-trees' },
            { label: 'Items & Equipment', slug: 'docs/world-building/items-and-equipment' },
            { label: 'Merchants & Economy', slug: 'docs/world-building/merchants' },
            { label: 'Quests', slug: 'docs/world-building/quests' },
            { label: 'The Content Editor', slug: 'docs/world-building/content-editor' },
          ],
        },
        {
          label: 'Game Systems',
          items: [
            { label: 'Combat System', slug: 'docs/game-systems/combat' },
            { label: 'Character Progression', slug: 'docs/game-systems/character-progression' },
            { label: 'Skills & Spells', slug: 'docs/game-systems/skills-and-spells' },
            { label: 'Status Effects', slug: 'docs/game-systems/status-effects' },
            { label: 'Loot Tables', slug: 'docs/game-systems/loot-tables' },
            { label: 'Mana System', slug: 'docs/game-systems/mana-system' },
          ],
        },
        {
          label: 'Scripting',
          items: [
            { label: 'Lua Scripting Overview', slug: 'docs/scripting/overview' },
            { label: 'API Reference', slug: 'docs/scripting/api-reference' },
            { label: 'Custom Mechanics', slug: 'docs/scripting/custom-mechanics' },
            { label: 'Event Hooks', slug: 'docs/scripting/event-hooks' },
            { label: 'Examples', slug: 'docs/scripting/examples' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Docker Deployment', slug: 'docs/deployment/docker' },
            { label: 'Environment Variables', slug: 'docs/deployment/environment-variables' },
            { label: 'Auth0 Setup', slug: 'docs/deployment/auth0-setup' },
            { label: 'Nginx Configuration', slug: 'docs/deployment/nginx' },
            { label: 'Production Checklist', slug: 'docs/deployment/production-checklist' },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Development Setup', slug: 'docs/contributing/development-setup' },
            { label: 'Code Structure', slug: 'docs/contributing/code-structure' },
            { label: 'Build from Source', slug: 'docs/contributing/building-from-source' },
            { label: 'Pull Request Guidelines', slug: 'docs/contributing/pull-requests' },
            { label: 'Roadmap', slug: 'docs/contributing/roadmap' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/TalesMUD/talesmudio/edit/main/src/content/docs/',
      },
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:title',
            content: 'TalesMUD — Forge Your Own Tale',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:description',
            content: 'An open-source framework for building browser-based Multi-User Dungeons. Go backend, Svelte frontend, zero telnet required.',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:url',
            content: 'https://talesmud.io',
          },
        },
      ],
      components: {
        // Override Starlight components as needed
      },
    }),
  ],
});
