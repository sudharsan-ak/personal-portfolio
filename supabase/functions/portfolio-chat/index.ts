import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This context is read by the AI to answer questions about your portfolio
const portfolioContext = `
You are an AI assistant for SUDHARSAN SRINIVASAN's portfolio website.
Answer questions based on the following information:

# About
Full Stack Software Engineer with 5+ years of experience building scalable, high-performance, API-first web applications across front-end and back-end systems. Skilled in JavaScript, TypeScript, React, Node.js, and modern UI/UX practices.

# Experience
Software Engineer | FORTRESS INFORMATION SECURITY, Lewisville, TX (Jun 2023 - Present)
- Delivered internal and client-facing features using React/Meteor UI with backend APIs and MongoDB pipelines.
- Implemented RBAC access control to improve workflow and security.
- Mentored junior engineers, led code reviews, contributed to SBOM/HBOM initiatives.
- Collaborated with major U.S. energy utilities and renewable energy providers.

Associate Software Engineer | FORTRESS INFORMATION SECURITY, Lewisville, TX (Jun 2021 - May 2023)
- Participated in Scrum ceremonies, leveraged CI/CD pipelines.
- Optimized internal cyber risk tools (~15% faster processing), refactored UI components (~30% faster load).
- Enhanced MongoDB workflows across clients.

Full Stack Developer Intern | MERCH, Lewisville, TX (Aug 2020 - May 2021)
- Built responsive SEO-optimized front end pages with WordPress, HTML, CSS.
- Increased organic traffic by 20% over 3 months.
- Integrated APIs for standalone applications and partner storefronts.

Software Engineer | COGNIZANT, Chennai, India (Jan 2018 - Nov 2018)
- Developed and optimized COBOL backend jobs for Policy Management Systems.
- Deployed code changes on IBM Mainframe production servers.

# Projects
Personal Portfolio Website | React, TypeScript, Tailwind CSS, PostgreSQL, Vercel
- Built a modern portfolio website showcasing projects.
- Implemented full-stack contact form using Supabase/PostgreSQL and serverless API.

Event Management System | Java, MySQL, Selenium
- Web app for event booking and cancellation using Java Servlet Pages.
- Automated testing with Selenium IDE, 100% coverage.

Software Testing Using Java | Java, JUnit, JaCoCo
- Basis path testing with MCDC criteria, high code quality and test coverage.

# Skills
Languages: JavaScript, TypeScript, Java, C/C++, PHP, SQL
Databases: MongoDB, MySQL, SQL Server, PostgreSQL (Supabase)
Frontend: React, HTML5, CSS, Meteor, Lodash, Tailwind
Backend: Node.js, Express, NestJS, Laravel, XML, REST APIs
Testing: JUnit, Selenium, JaCoCo
Tools: Git, VS Code, Agile/Scrum, Figma, CI/CD
AI Tools: ChatGPT, Claude, Gemini, Copilot, Grok

# Education
MS Computer Science - University of Texas, Arlington (2019-2021)
BE Computer Science & Engineering - Anna University, India (2013-2017)

# Contact
Email: sudharsanak1010@gmail.com
LinkedIn: linkedin.com/in/sudharsan-srinivasan10
GitHub: github.com/sudharsan-ak

Instructions:
- Be concise, professional, and helpful
- If asked about something not covered above, politely explain what you know
- Suggest relevant portfolio sections when appropriate
- Keep responses focused unless more detail is requested
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: portfolioContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI gateway error: ${response.status} ${errorText}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Error in portfolio-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
