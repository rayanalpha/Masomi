import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { withDatabaseRetry } from "@/lib/db-serverless";
import { z } from "zod";

const productCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  price: z.number().optional(),
  sku: z.string().optional(),
  categorySlug: z.string().optional(),
  imageUrl: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const perPage = Math.min(Number(searchParams.get("perPage") || 20), 100);
  const q = searchParams.get("q") || undefined;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { sku: { contains: q } },
        ],
      }
    : {};

  try {
    const result = await withDatabaseRetry(async (prisma) => {
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: perPage,
          skip: (page - 1) * perPage,
          include: { categories: true, images: true },
        }),
        prisma.product.count({ where }),
      ]);
      
      return { items, page, perPage, total };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] GET /api/products error:', error);
    return NextResponse.json({
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API] POST /api/products called');
    
    // Check session first (outside of database operations)
    const session = await getServerSession(authOptions);
    console.log('[API] Session check:', {
      hasSession: !!session,
      user: session?.user ? {
        email: session.user.email,
        role: (session.user as any).role
      } : null
    });
    
    const role = (session?.user as any)?.role as string | undefined;
    if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
      console.log('[API] Authorization failed:', { hasSession: !!session, role });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log('[API] Request body:', body);
    
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      console.log('[API] Validation failed:', parsed.error);
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    console.log('[API] Validated data:', data);

    // Use enhanced serverless database operations
    const result = await withDatabaseRetry(async (prisma) => {
      // Find category if specified
      let categoriesConnect: { id: string }[] = [];
      if (data.categorySlug) {
        console.log('[API] Looking for category with slug:', data.categorySlug);
        const cat = await prisma.category.findUnique({ 
          where: { slug: data.categorySlug } 
        });
        console.log('[API] Found category:', cat);
        if (cat) categoriesConnect = [{ id: cat.id }];
      }

      const createData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        sku: data.sku,
        status: data.status ?? "DRAFT",
        visibility: data.visibility ?? "PUBLIC",
        stock: typeof data.stock === "number" ? data.stock : undefined,
        categories: categoriesConnect.length ? { connect: categoriesConnect } : undefined,
        images: data.imageUrl ? { create: [{ url: data.imageUrl, alt: data.name }] } : undefined,
      };
      
      console.log('[API] Creating product with data:', createData);
      
      const created = await prisma.product.create({ 
        data: createData,
        include: {
          categories: true,
          images: true
        }
      });
      
      console.log('[API] Product created successfully:', created.id);
      return created;
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API] Error in POST /api/products:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

