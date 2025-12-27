import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Persona } from '@/types';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { record } = await req.json();

        if (!record || record.sender_type !== 'user') {
            return NextResponse.json({ message: 'Skipped' });
        }

        const convId = record.conversation_id;

        const { data: conv, error } = await supabaseAdmin
            .from('conversations')
            .select('*, personas(*), scenarios(*)')
            .eq('id', convId)
            .single();

        if (error || !conv) throw new Error('Conversation not found');

        const p = conv.personas;
        const aiResponse = generateAIResponse(record.content, p);

        await supabaseAdmin.from('messages').insert({
            conversation_id: convId,
            content: aiResponse,
            sender_type: 'persona'
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

function generateAIResponse(input: string, p: Persona) {
    const traits = `(Traits: O:${p.o_score}, E:${p.e_score}, A:${p.a_score})`;
    let style = p.tone === 'Professional' ? "From a formal perspective," : "Hey! Dealing with this,";

    if (p.a_score > 70) style = "I completely agree with you!";

    return `[AI ${p.role}] ${style} Regarding your message: "${input}", I believe we should proceed with a ${p.tone} strategy. ${traits}`;
}