import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export function GET() {return NextResponse.json({ok:true,app:'nestfix',phase:1,now:new Date().toISOString()});}
