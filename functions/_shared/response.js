export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function getDatabase(env) {
  if (!env.DB) {
    throw new Error('Cloudflare D1 binding "DB" is not configured.');
  }

  return env.DB;
}

export function errorMessage(error) {
  return error instanceof Error ? error.message : "Unexpected server error.";
}
