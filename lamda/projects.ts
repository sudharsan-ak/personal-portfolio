// lambda/projects.ts
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { fetchProjectsAWS } from "../api/projectsAWS";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const corsHeaders = {
  "access-control-allow-origin": ALLOWED_ORIGIN,
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type",
};

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;

  // Preflight for browser CORS
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }

  // Only GET
  if (method !== "GET") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const qs = (event.queryStringParameters ?? {}) as any;
    const result = await fetchProjectsAWS(qs);

    return {
      statusCode: result.statusCode,
      headers: { ...corsHeaders, "content-type": "application/json" },
      body: JSON.stringify(result.body),
    };
  } catch (e: any) {
    console.error("Lambda projects error:", e);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
      body: JSON.stringify({ error: "Server error", message: e?.message ?? "Unexpected error" }),
    };
  }
}
