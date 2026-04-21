# Project: LinkedReach AI

## Overview
A Chrome extension that automates recruiter outreach research on LinkedIn. When visiting a LinkedIn profile, it scrapes the person's name, company, and domain, then uses AI (Groq LLM) and web search to infer likely email addresses — returning ranked candidates with confidence scores and source links.

## Technologies
JavaScript, Chrome Extension API (Manifest V3), Groq LLM, DuckDuckGo Search, Serper API, HTML, CSS

## Key Features & Achievements
- Auto-extracts name, company, and domain from active LinkedIn profile pages
- Uses Groq LLM to infer probable email address patterns from web search results
- Returns ranked email candidates with confidence scores and source attribution
- Privacy-conscious: all API keys and data stay on-device via Chrome local storage
- Optional Serper API integration for higher-quality search results
- Built with Chrome Extension Manifest V3

## Links
- GitHub: https://github.com/sudharsan-ak/linkedin-reach-ai
