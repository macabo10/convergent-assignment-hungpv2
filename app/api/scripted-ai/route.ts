import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Persona, Scenario } from '@/types';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const record = payload.record;

        if (!record || record.sender_type !== 'user') {
            return NextResponse.json({ message: 'Skipped' });
        }

        const convId = record.conversation_id;

        const { data: conv, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('*, personas(*), scenarios(*)')
            .eq('id', convId)
            .single();

        if (convError || !conv) throw new Error('Context not found');

        const p = conv.personas;
        const s = conv.scenarios;

        const isTaxScenario = s.subject.toLowerCase().includes('tax');

        const taxHints = [
            "Compliance: Verify the client's tax residency certificate before providing VAT advice.",
            "Tip: Ask for the specific tax year to ensure you are referencing the correct 2025 regulations.",
            "Nudge: Remind the client about the $50,000 annual threshold for offshore filings.",
            "Next Step: Summarize the VAT exemptions discussed to ensure client understanding."
        ];

        const gameHints = [
            "Empathy: Acknowledge the loss of progress immediately to de-escalate frustration.",
            "Tip: Ask for the specific error code or the 'backup_temp' file location.",
            "Compliance: Remind the player about the 2-hour gameplay limit for refund eligibility.",
            "Next Step: Explain the technical escalation process to manage their expectations."
        ];

        const selectedHints = isTaxScenario ? taxHints : gameHints;
        const randomHint = selectedHints[Math.floor(Math.random() * selectedHints.length)];
        await supabaseAdmin.from('messages').insert({
            conversation_id: convId,
            content: randomHint,
            sender_type: 'hint'
        });


        const aiResponse = generateAIResponse(record.content, p, s);

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

function generateAIResponse(input: string, p: Persona, s: Scenario): string {
    const isGentle = p.a_score > 70;
    const isTaxScenario = s.subject.toLowerCase().includes('tax');

    // 1. Determine Greeting Style based on Persona and Scenario
    let responsePrefix = "";
    if (isGentle) {
        responsePrefix = `[AI ${p.role}] I completely agree with you and I'm here to help! `;
    } else {
        responsePrefix = `[AI ${p.role}] Hey! Dealing with this, `;
    }

    // 2. Scenario-Specific Contextual Logic
    let contextResponse = "";
    if (isTaxScenario) {
        contextResponse = isGentle
            ? `I understand VAT can be confusing. Regarding "${input}", let's look at the offshore regulations together.`
            : `VAT is a headache and your question "${input}" isn't making it easier. What do you want?`;
    } else {
        // Gaming Scenario
        contextResponse = isGentle
            ? `I'm so sorry about the game bug. Regarding "${input}", I'll do my best to recover your progress!`
            : `Your bug report "${input}" is just another problem for me to deal with. Fix your own hardware!`;
    }

    // 3. Final Polish with Tone recommendation
    return `${responsePrefix}${contextResponse} I recommend a ${p.tone} approach.`;
}
