import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { z } from "zod";
import { withDatabaseRetry } from "@/lib/db-serverless";
import { deleteImages } from "@/lib/storage";

// Set maximum execution time for serverless functions (in seconds)
export const maxDuration = 30;

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  sku: z.string().nullable().optional(),
  stock: z.number().int().min(0).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    
    const product = await withDatabaseRetry(async (prisma) => {
      return await prisma.product.findUnique({
        where: { id },
        include: { categories: true, images: true, variations: true },
      });
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('[API] GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    
    if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const json = await req.json();
    const parsed = updateSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await ctx.params;
    
    const updated = await withDatabaseRetry(async (prisma) => {
      return await prisma.product.update({
        where: { id },
        data: parsed.data
      });
    });
    
    return NextResponse.json(updated);
    
  } catch (error: any) {
    console.error('[API] PATCH /api/products/[id] error:', error);
    
    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 409 }
      );
    }
    
    // Handle not found errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    
    if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await ctx.params;
    
    // Get product with images before deletion
    const product = await withDatabaseRetry(async (prisma) => {
      return await prisma.product.findUnique({
        where: { id },
        include: { images: true }
      });
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete product from database
    await withDatabaseRetry(async (prisma) => {
      return await prisma.product.delete({ where: { id } });
    });
    
    // Delete associated images from storage (async, don't block response)
    if (product.images.length > 0) {
      const imageUrls = product.images.map(img => img.url);
      console.log(`[API] Scheduling cleanup of ${imageUrls.length} images for deleted product`);
      
      // Fire and forget - don't wait for storage cleanup
      deleteImages(imageUrls).catch(err => {
        console.error('[API] Storage cleanup failed (non-critical):', err);
      });
    }
    
    return new NextResponse(null, { status: 204 });
    
  } catch (error: any) {
    console.error('[API] DELETE /api/products/[id] error:', error);
    
    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete product: it has related records' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

