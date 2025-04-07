// app/api/fabric/assets/route.ts
import { NextResponse } from 'next/server';
import { addObjectAttributes } from '@/services/fabric/authorization';
import { ObjectAttribute } from '@/types/fabric';

export async function POST(req: Request) {
    const objectAttribute = await req.json() as ObjectAttribute;
    if (!objectAttribute) {
        return NextResponse.json({ error: 'Invalid object attribute' }, { status: 400 });
    }
    console.log(objectAttribute);
    const response = await addObjectAttributes(objectAttribute);
    return NextResponse.json(response, { status: 201 });
}