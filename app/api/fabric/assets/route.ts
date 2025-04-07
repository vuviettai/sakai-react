// app/api/fabric/assets/route.ts
import { NextResponse } from 'next/server';
import { createAsset, getAllAssets } from '@/services/fabric/asset';
import { Asset } from '@/types/fabric';

export async function POST(req: Request) {
    const asset = await req.json() as Asset;
    if (!asset.title || typeof asset.title !== 'string') {
        return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
    }
    const newAsset = await createAsset(asset);
    return NextResponse.json(newAsset, { status: 201 });
}

export async function GET(req: Request) {
    const assets = await getAllAssets();
    return NextResponse.json(assets, { status: 200 });
}
