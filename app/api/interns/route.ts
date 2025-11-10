// app/api/interns/route.ts
export async function GET() {
  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbwVuuQz9lQCPnMUOwztDrLyzlgCa9rtoh4-X6qqA7fgsz3vF-T-WeLwwFeXSB3wRrsr/exec"
  );
  const text = await res.text();
  return new Response(text, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type");
  let body: BodyInit;

  if (contentType?.includes("application/json")) {
    body = JSON.stringify(await req.json());
  } else {
    body = await req.formData();
  }

  const res = await fetch(
    "https://script.google.com/macros/s/AKfycbwQYQh0dvo6TQf8QNmP6WbFeZcZcrLER_LImp0dNFEUf0NZywievPa7FNpbk6QqrZkH/exec",
    { method: "POST", body }
  );

  const text = await res.text();
  return new Response(text, {
    headers: { "Content-Type": "application/json" },
  });
}
