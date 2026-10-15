# Project: Trakt for ChatGPT

## Overview
A backend that connects a Trakt.tv account to ChatGPT two ways: a Custom GPT Action and a Model Context Protocol (MCP) server, with OAuth-gated read and write access to watch history, watchlists, and ratings.

## Technologies
TypeScript, Node.js, MCP, OAuth, Supabase

## Key Features & Achievements
- Read and write access, gated behind a search-then-confirm-then-write flow, never a raw title match
- MCP server built alongside the original REST API as ChatGPT migrates off Custom GPT Actions
- Continue Watching logic rebuilt to match Trakt's own website behavior, not just raw playback data

## Links
- GitHub: https://github.com/sudharsan-ak/trakt-bridge
