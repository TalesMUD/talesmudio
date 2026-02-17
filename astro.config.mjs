// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://talesmud.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
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
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
            { label: 'Your First World', slug: 'getting-started/first-world' },
          ],
        },
        {
          label: 'Core Concepts',
          items: [
            { label: 'Architecture Overview', slug: 'core-concepts/architecture' },
            { label: 'The Game Loop', slug: 'core-concepts/game-loop' },
            { label: 'Message System', slug: 'core-concepts/message-system' },
            { label: 'Rooms & Zones', slug: 'core-concepts/rooms-and-zones' },
            { label: 'Characters & Classes', slug: 'core-concepts/characters' },
            { label: 'Data Storage', slug: 'core-concepts/data-storage' },
          ],
        },
        {
          label: 'World Building',
          items: [
            { label: 'Creating Rooms', slug: 'world-building/creating-rooms' },
            { label: 'Building Zones', slug: 'world-building/building-zones' },
            { label: 'NPCs & Spawners', slug: 'world-building/npcs-and-spawners' },
            { label: 'Dialog Trees', slug: 'world-building/dialog-trees' },
            { label: 'Items & Equipment', slug: 'world-building/items-and-equipment' },
            { label: 'Merchants & Economy', slug: 'world-building/merchants' },
            { label: 'Quests', slug: 'world-building/quests' },
            { label: 'The Content Editor', slug: 'world-building/content-editor' },
          ],
        },
        {
          label: 'Game Systems',
          items: [
            { label: 'Combat System', slug: 'game-systems/combat' },
            { label: 'Character Progression', slug: 'game-systems/character-progression' },
            { label: 'Skills & Spells', slug: 'game-systems/skills-and-spells' },
            { label: 'Status Effects', slug: 'game-systems/status-effects' },
            { label: 'Loot Tables', slug: 'game-systems/loot-tables' },
            { label: 'Mana System', slug: 'game-systems/mana-system' },
          ],
        },
        {
          label: 'Scripting',
          items: [
            { label: 'Lua Scripting Overview', slug: 'scripting/overview' },
            { label: 'API Reference', slug: 'scripting/api-reference' },
            { label: 'Custom Mechanics', slug: 'scripting/custom-mechanics' },
            { label: 'Event Hooks', slug: 'scripting/event-hooks' },
            { label: 'Examples', slug: 'scripting/examples' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Docker Deployment', slug: 'deployment/docker' },
            { label: 'Environment Variables', slug: 'deployment/environment-variables' },
            { label: 'Auth0 Setup', slug: 'deployment/auth0-setup' },
            { label: 'Nginx Configuration', slug: 'deployment/nginx' },
            { label: 'Production Checklist', slug: 'deployment/production-checklist' },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Development Setup', slug: 'contributing/development-setup' },
            { label: 'Code Structure', slug: 'contributing/code-structure' },
            { label: 'Build from Source', slug: 'contributing/building-from-source' },
            { label: 'Pull Request Guidelines', slug: 'contributing/pull-requests' },
            { label: 'Roadmap', slug: 'contributing/roadmap' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/TalesMUD/talesmudio/edit/main/',
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
            content: 'TalesMUD — Build Your Text World',
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
