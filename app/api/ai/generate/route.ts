import { NextResponse } from "next/server";
import { RECREATION_DATA } from "@/data/recreationData";
import sharp from "sharp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type GenerateRequestBody = {
  exhibitId?: string;
  imageUrl?: string;
  prompt: string;
  title?: string;
};

type GenerateResponseBody = {
  newTitle: string;
  newImage: string;
  usedMock?: boolean;
  sourceImage?: string;
};

function getSourceImageUrl(input: { exhibitId?: string; imageUrl?: string }): string | null {
  if (input.imageUrl && typeof input.imageUrl === "string") {
    return input.imageUrl;
  }

  if (input.exhibitId) {
    const exhibit = RECREATION_DATA.find((item) => item.id === input.exhibitId);
    if (exhibit?.pic) return exhibit.pic;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const prompt = (body?.prompt || "").trim();
    const title = (body?.title || "").trim();
    const sourceImageUrl = getSourceImageUrl({ exhibitId: body?.exhibitId, imageUrl: body?.imageUrl });

    if (!prompt) {
      return NextResponse.json({ error: "缺少提示词 prompt" }, { status: 400 });
    }
    if (!sourceImageUrl) {
      return NextResponse.json({ error: "需要提供 exhibitId 或 imageUrl" }, { status: 400 });
    }

    const upstreamUrl = process.env.MUSEUM_AI_API_URL;
    const upstreamKey = process.env.MUSEUM_AI_API_KEY;

    if (upstreamUrl) {
      try {
        const upstreamRes = await fetch(upstreamUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(upstreamKey ? { Authorization: `Bearer ${upstreamKey}` } : {}),
          },
          body: JSON.stringify({
            prompt,
            imageUrl: sourceImageUrl,
            title: title || undefined,
          }),
          // 60s timeout via AbortController if needed by consumers
        });

        if (!upstreamRes.ok) {
          const text = await upstreamRes.text();
          console.error("Upstream error", upstreamRes.status, text);
          // fall through to mock response
        } else {
          const data = (await upstreamRes.json()) as Partial<GenerateResponseBody> & Record<string, any>;
          const newImage = (data as any).newImage || (data as any).imageUrl || (data as any).outputUrl;
          const newTitle = (data as any).newTitle || (data as any).title || `${prompt.slice(0, 10)} 二创`;
          if (newImage) {
            const response: GenerateResponseBody = {
              newTitle,
              newImage,
              usedMock: false,
              sourceImage: sourceImageUrl,
            };
            return NextResponse.json(response);
          }
        }
      } catch (error) {
        console.error("Error calling upstream:", error);
        // fall back to mock below
      }
    }

    // If no custom upstream URL is configured, but an API key is provided, try OpenAI Images Edits API
    const openaiKey = process.env.OPENAI_API_KEY || process.env.MUSEUM_AI_API_KEY;
    if (!upstreamUrl && openaiKey) {
      try {
        // Fetch the source image data
        const imageRes = await fetch(sourceImageUrl);
        if (!imageRes.ok) {
          console.error("Failed to fetch source image", imageRes.status);
          throw new Error("源图下载失败");
        }
        const contentType = imageRes.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await imageRes.arrayBuffer();

        // Convert any input to PNG (OpenAI edits prefers PNG) and clamp size
        const pngBuffer = await sharp(Buffer.from(arrayBuffer))
          .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
          .png()
          .toBuffer();
        const blob = new Blob([pngBuffer], { type: "image/png" });

        const form = new FormData();
        form.append("model", "gpt-image-1");
        form.append("prompt", prompt);
        // OpenAI edits API expects field name `image[]` for one or more images
        form.append("image[]", blob, "source" + (contentType.includes("png") ? ".png" : ".jpg"));
        form.append("size", "1024x1024");
        form.append("n", "1");

        const aiRes = await fetch("https://api.openai.com/v1/images/edits", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
          },
          body: form,
        });

        if (!aiRes.ok) {
          const text = await aiRes.text();
          console.error("OpenAI error", aiRes.status, text);
          // fall through to mock
        } else {
          const data = (await aiRes.json()) as any;
          const first = data?.data?.[0];
          const url = first?.url || (first?.b64_json ? `data:image/png;base64,${first?.b64_json}` : undefined);
          if (url) {
            const response: GenerateResponseBody = {
              newTitle: title || `${prompt.slice(0, 10)} 二创`,
              newImage: url,
              usedMock: false,
              sourceImage: sourceImageUrl,
            };
            return NextResponse.json(response);
          }
        }
      } catch (error) {
        console.error("Error calling OpenAI:", error);
        // fall back to mock below
      }
    }

    // Mock/fallback response when no upstream is configured or fails
    const fallbackNewTitle = `${(prompt || "AI").slice(0, 10)} 二创`;
    const fallbackNewImage = "/placeholder.jpg";

    const response: GenerateResponseBody = {
      newTitle: title || fallbackNewTitle,
      newImage: fallbackNewImage,
      usedMock: true,
      sourceImage: sourceImageUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("/api/ai/generate error:", error);
    return NextResponse.json({ error: "服务端发生错误" }, { status: 500 });
  }
}


