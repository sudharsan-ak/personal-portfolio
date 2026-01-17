// lambda/projects.ts
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { fetchProjectsAWS } from "../api/projectsAWS";

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext.http.method;

  // Function URL already handles CORS preflight if enabled in AWS console.
  // We keep this for safety, but we DO NOT set any CORS headers here.
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {},
      body: "",
    };
  }

  // Only allow GET
  if (method !== "GET") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const qs = (event.queryStringParameters ?? {}) as any;
    const result = await fetchProjectsAWS(qs);

    return {
      statusCode: result.statusCode,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(result.body),
    };
  } catch (e: any) {
    console.error("Lambda projects error:", e);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "Server error",
        message: e?.message ?? "Unexpected error",
      }),
    };
  }
}
