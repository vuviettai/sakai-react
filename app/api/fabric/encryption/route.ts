// app/api/fabric/assets/route.ts
import { NextResponse } from 'next/server';
import { importPubKey } from '@/services/fabric/encryption';
import { PubKey } from '@/types/fabric';

export async function POST(req: Request) {
    const { org, pubkey } = await req.json() as PubKey;
    if (!pubkey || typeof pubkey !== 'string') {
        return NextResponse.json({ error: 'Invalid pubkey' }, { status: 400 });
    }
    const response = await importPubKey(org, pubkey);
    return NextResponse.json(response, { status: 201 });
}