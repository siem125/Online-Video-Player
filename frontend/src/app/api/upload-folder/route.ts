import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Forward multipart/form-data request to C# backend

  // Assuming your C# backend is running on some URL:
  const backendUrl = process.env.CSHARP_API_URL;

  // Clone request body (formData) for forwarding
  const formData = await req.formData();

  // To forward formData in a fetch, you must build a new FormData:
  const forwardFormData = new FormData();

  for (const [key, value] of formData.entries()) {
    forwardFormData.append(key, value);
  }

  const apiUrl = backendUrl + "/api/VideoProject/series/upload-folder";
  //console.log(apiUrl);

  try{
    // Forward to C# backend
    const response = await fetch(apiUrl, {
      method: "POST",
      body: forwardFormData,
      // Note: do not set content-type header explicitly; browser/node will set multipart/form-data boundary correctly
    });

    // Proxy response back to client
    const data = await response.json();
    //console.log("logs:", data.logs); // ← should now work

    // const rawText = await response.text(); // <--- changed from .json()
    // console.log("RAW response from C# backend:", rawText);

    return NextResponse.json(data, { status: response.status });
  } catch(error) {
    console.error("❌ Proxy fetch error:", error);
    return NextResponse.json({ error: "Proxy failed to reach backend" }, { status: 500 });
  }
}
