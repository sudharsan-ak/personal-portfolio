# Design Guidelines: Professional Developer Portfolio

## Design Approach
**Reference-Based Approach**: Drawing inspiration from modern developer portfolios (Linear, Vercel, GitHub profiles) with emphasis on clean typography, clear information hierarchy, and professional presentation. Focus on showcasing technical expertise through structured content presentation.

## Core Design Principles
- **Developer-First Aesthetics**: Clean, modern interface that appeals to technical recruiters and peers
- **Information Clarity**: Clear hierarchy prioritizing experience and technical skills
- **Professional Authority**: Sophisticated layout that establishes credibility
- **Content-Driven Design**: Let achievements and projects speak through strategic presentation

## Typography System

**Font Families** (Google Fonts):
- Primary: Inter (headings, navigation, labels)
- Secondary: JetBrains Mono (code snippets, technical details)

**Hierarchy**:
- Hero Name: text-6xl md:text-7xl font-bold tracking-tight
- Hero Tagline: text-xl md:text-2xl font-normal
- Section Headings: text-4xl md:text-5xl font-bold
- Subsection Titles: text-2xl md:text-3xl font-semibold
- Job Titles/Project Names: text-xl font-semibold
- Company Names: text-lg font-medium
- Body Text: text-base leading-relaxed
- Technical Labels: text-sm font-mono uppercase tracking-wide
- Metadata: text-sm opacity-70

## Layout System

**Spacing Primitives**: Tailwind units of 4, 8, 12, 16, 20, 24, 32
- Section padding: py-20 md:py-32
- Content spacing: space-y-8 md:space-y-12
- Component gaps: gap-4, gap-8, gap-12
- Card padding: p-8

**Container Strategy**:
- Full-width sections with max-w-7xl inner containers
- Content sections: max-w-6xl mx-auto px-8
- Text-heavy areas: max-w-4xl for readability

**Grid Usage**:
- Skills grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Project cards: grid-cols-1 md:grid-cols-2 gap-8
- Experience timeline: Single column with left-aligned content

## Component Library

### Hero Section (Full viewport ~90vh)
- Professional headshot image (right side on desktop, centered on mobile)
- Large typography hierarchy: Name → Title → Tagline from resume summary
- Primary CTA: "View Projects" + Secondary: "Download Resume"
- Social links bar: LinkedIn, GitHub, Email icons
- Scroll indicator at bottom

### Navigation
- Fixed header on scroll with backdrop blur
- Logo/Name (left) + Navigation links (right): About, Experience, Projects, Skills, Contact
- Mobile: Hamburger menu with slide-in navigation

### About Section
- Two-column layout (desktop): Professional summary (left) + Education cards (right)
- Education cards showcase: University logo placeholder, degree, GPA, relevant coursework
- Highlight 5+ years experience and full-stack expertise

### Experience Timeline
- Chronological cards with company logo placeholders
- Each card contains: Company name, role, duration, location, tech stack tags, 4-6 bullet achievements
- Progressive disclosure: Expandable for full details on mobile
- Visual timeline connector line on desktop

### Projects Showcase
- Grid of 3 project cards with hover elevation
- Each card: Project name, tech stack badges, description (2-3 lines), GitHub link icon
- Featured project gets larger card treatment
- Include: Personal Portfolio, Event Management System, Software Testing project

### Skills Matrix
- Organized by categories from resume: Languages, Databases, Frameworks, Web Technologies, Testing, Tools, AI Tools
- Badge-style presentation with subtle borders
- Group related technologies together
- Responsive grid adapts from 4 columns to 2 on mobile

### Contact Section
- Centered layout with primary email CTA
- Secondary contact grid: LinkedIn, GitHub, Location
- Optional contact form (name, email, message fields)
- Footer with social links and copyright

## Interaction Patterns
- Smooth scroll navigation between sections
- Subtle hover effects on cards (translate-y-1, shadow elevation)
- Tech badge pills with subtle borders, no background
- Links use underline decoration on hover
- Buttons use solid fills with hover brightness adjustments

## Images

**Hero Image**: Professional headshot or workspace photo (500x500px minimum)
- Placement: Right side of hero section on desktop, creates visual balance
- Treatment: Subtle border or shadow, slight rounded corners (rounded-lg)

**Company Logos**: Placeholders for Fortress, Merch, Cognizant (100x100px)
- Placement: Left side of each experience card
- Treatment: Grayscale with slight opacity, color on hover

**University Logos**: UT Arlington, Anna University (80x80px)
- Placement: Within education cards in About section

**Project Screenshots**: Optional thumbnails for project cards (400x300px)
- Placement: Top of project cards if included
- Treatment: Rounded corners, shadow on hover

## Accessibility
- Semantic HTML5 structure with proper heading hierarchy
- ARIA labels for navigation and interactive elements
- Keyboard navigation support for all interactive components
- Focus visible states with clear outlines
- Skip-to-content link for screen readers
- Sufficient contrast ratios throughout

## Responsive Behavior
- Mobile-first approach with progressive enhancement
- Hero: Stacked layout on mobile (image top, content below)
- Experience cards: Full-width stacking on mobile with condensed information
- Skills grid: 2 columns on mobile, 3-4 on desktop
- Navigation: Hamburger menu below 768px breakpoint
- Touch-friendly tap targets (minimum 44x44px)