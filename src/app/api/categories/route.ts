import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { withDatabaseRetry } from "@/lib/db-serverless";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    console.log('[API] GET /api/categories called');
    
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || undefined;
    const where = q ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }] } : {};

    const result = await withDatabaseRetry(async (prisma) => {
      const items = await prisma.category.findMany({
        where,
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
        include: {
          parent: true,
          children: true,
          _count: {
            select: { products: true }
          }
        },
      });
      return { items };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] GET /api/categories error:', error);
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API] POST /api/categories called');
    
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    
    if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
      console.log('[API] Authorization failed:', { hasSession: !!session, role });
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const json = await request.json();
    console.log('[API] Request body:', json);
    
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      console.log('[API] Validation failed:', parsed.error);
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await withDatabaseRetry(async (prisma) => {
      // Validate parent exists if specified
      if (parsed.data.parentId) {
        const parent = await prisma.category.findUnique({
          where: { id: parsed.data.parentId }
        });
        if (!parent) {
          throw new Error(`Parent category with id ${parsed.data.parentId} not found`);
        }
      }
      
      const created = await prisma.category.create({ 
        data: parsed.data,
        include: {
          parent: true,
          children: true
        }
      });
      
      console.log('[API] Category created successfully:', created.id);
      return created;
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API] Error in POST /api/categories:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

