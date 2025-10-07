import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// Set maximum execution time for serverless functions (in seconds)
export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ items: [] });

  const products = await prisma.product.findMany({
    where: {
      AND: [
        { status: "PUBLISHED" },
        { visibility: "PUBLIC" },
        { OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { categories: { some: { name: { contains: q } } } },
        ]}
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { images: { orderBy: [{ sort: "asc" }, { id: "asc" }] } },
  });

  const items = await Promise.all(products.map(async (p) => {
    let imageUrl = "/file.svg"; // Default fallback image
    
    if (p.images[0]?.url) {
      const originalUrl = p.images[0].url;
      
      // If it's an upload image, try to find thumbnail
      if (originalUrl.startsWith("/uploads/")) {
        const filename = originalUrl.replace("/uploads/", "");
        const nameWithoutExt = filename.replace(/\.[^.]+$/, "");
        
        // Try different thumbnail formats in order of preference
        const possibleThumbnails = [
          `/uploads/_thumbs/${nameWithoutExt}.webp`,  // New WebP format (preferred)
          `/uploads/_thumbs/${nameWithoutExt}.jpeg`,  // Old JPEG format
          `/uploads/_thumbs/${nameWithoutExt}.jpg`,   // Alternative JPEG
        ];
        
        // Check which thumbnail exists
        let thumbnailFound = false;
        for (const thumbPath of possibleThumbnails) {
          try {
            const fullPath = path.join(process.cwd(), "public", thumbPath);
            await fs.access(fullPath);
            imageUrl = thumbPath;
            thumbnailFound = true;
            console.log(`[Search API] Found thumbnail: ${thumbPath}`);
            break;
          } catch {
            // Continue to next option
          }
        }
        
        // If no thumbnail found, use original image
        if (!thumbnailFound) {
          imageUrl = originalUrl;
          console.log(`[Search API] Using original image: ${originalUrl}`);
        }
      } else {
        // Use original URL for external images
        imageUrl = originalUrl;
      }
    }
    
    return {
      slug: p.slug,
      name: p.name,
      image: imageUrl,
    };
  }));
  return NextResponse.json({ items });
}
