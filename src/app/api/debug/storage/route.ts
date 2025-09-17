import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const hasSupabaseUrl = !!process.env.SUPABASE_URL;
    const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const response = {
      timestamp: new Date().toISOString(),
      supabase: {
        hasUrl: hasSupabaseUrl,
        hasServiceKey: hasSupabaseKey,
        urlLength: process.env.SUPABASE_URL?.length || 0,
        keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      test: null as any
    };
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      try {
        console.log('Testing Supabase connection...');
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } }
        );
        
        // Test bucket access
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          response.test = {
            success: false,
            error: 'Bucket list failed',
            details: bucketsError.message
          };
        } else {
          response.test = {
            success: true,
            buckets: buckets?.map(b => b.name) || [],
            uploadsBucketExists: buckets?.some(b => b.name === 'uploads') || false
          };
        }
        
      } catch (error) {
        response.test = {
          success: false,
          error: 'Connection failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      response.test = {
        success: false,
        error: 'Missing credentials',
        details: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not provided'
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testUpload } = await request.json();
    
    if (!testUpload) {
      return NextResponse.json({
        error: 'Use { "testUpload": true } to test file upload'
      });
    }
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials'
      });
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    
    // Test upload small file
    const testData = Buffer.from('Hello World Test', 'utf8');
    const fileName = `test_${Date.now()}.txt`;
    
    console.log('Testing file upload to Supabase:', fileName);
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, testData, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Upload test failed',
        details: error.message,
        supabaseError: error
      });
    }
    
    // Try to delete the test file
    await supabase.storage.from('uploads').remove([fileName]);
    
    return NextResponse.json({
      success: true,
      message: 'Upload test successful',
      uploadedPath: data.path
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Upload test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}