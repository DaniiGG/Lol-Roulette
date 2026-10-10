import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAuth } from "@/lib/verify-jwt";
import { getChallengeById } from "@/lib/challenge-definitions";
import { calculateLevel } from "@/lib/achievements";

export async function GET(request: Request) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get active challenge session
    const { data: activeSession, error: activeError } = await supabaseAdmin
      .from("challenge_sessions")
      .select("*")
      .eq("user_id", auth.userId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeError && activeError.code !== "PGRST116") {
      console.error("Error fetching active challenge session:", activeError);
    }

    // Get challenge history
    const { data: history, error: historyError } = await supabaseAdmin
      .from("challenge_sessions")
      .select("*")
      .eq("user_id", auth.userId)
      .in("status", ["completed", "expired", "failed"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (historyError) {
      console.error("Error fetching challenge history:", historyError);
    }

    // Enrich with definitions
    const enrichSession = (session: any) => {
      const definition = getChallengeById(`${session.challenge_type}_${Object.values(session.challenge_config).join('_')}`) ||
        getChallengesByType(session.challenge_type).find((c: any) => 
          JSON.stringify(c.config) === JSON.stringify(session.challenge_config)
        );
      return {
        ...session,
        definition: definition ? {
          id: definition.id,
          name: definition.name,
          description: definition.description,
          category: definition.category,
          emoji: definition.emoji
        } : null
      };
    };

    return NextResponse.json({
      activeSession: activeSession ? enrichSession(activeSession) : null,
      history: (history || []).map(enrichSession)
    });
  } catch (error: any) {
    console.error("Challenge sessions GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start": {
        const { challenge_id, duration_hours } = body;
        
        if (!challenge_id || !duration_hours) {
          return NextResponse.json({ error: "challenge_id and duration_hours are required" }, { status: 400 });
        }

        if (![3, 5].includes(duration_hours)) {
          return NextResponse.json({ error: "Invalid duration. Must be 3 or 5 hours" }, { status: 400 });
        }

        const definition = getChallengeById(challenge_id);
        if (!definition) {
          return NextResponse.json({ error: "Invalid challenge" }, { status: 400 });
        }

        if (!definition.availableDurations.includes(duration_hours)) {
          return NextResponse.json({ error: "This duration is not available for this challenge" }, { status: 400 });
        }

        // Check if user already has an active challenge (server-side enforcement)
        const { data: existingActive, error: checkError } = await supabaseAdmin
          .rpc("can_start_challenge", { p_user_id: auth.userId });

        if (checkError) {
          console.error("Error checking active challenge:", checkError);
          return NextResponse.json({ error: "Failed to check active challenges" }, { status: 500 });
        }

        if (!existingActive) {
          return NextResponse.json({ 
            error: "You already have an active challenge. Wait for it to finish before starting a new one." 
          }, { status: 409 });
        }

        // Create the challenge session
        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration_hours * 60 * 60 * 1000);

        const { data: session, error: insertError } = await supabaseAdmin
          .from("challenge_sessions")
          .insert([{
            user_id: auth.userId,
            challenge_type: definition.type,
            challenge_config: definition.config,
            duration_hours,
            xp_multiplier: definition.xpMultiplier,
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            status: "active",
            valid_wins: 0,
            bonus_xp: 0,
            total_base_xp: 0
          }])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating challenge session:", insertError);
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        return NextResponse.json({ 
          session: {
            ...session,
            definition: {
              id: definition.id,
              name: definition.name,
              description: definition.description,
              category: definition.category,
              emoji: definition.emoji
            }
          }
        });
      }

      case "validate_match": {
        const { match_id, champion_name, champion_id, won, game_mode, game_duration, stats, game_end_timestamp } = body;
        
        if (!match_id || !champion_name || !champion_id) {
          return NextResponse.json({ error: "Missing required match data" }, { status: 400 });
        }

        // Get active challenge session
        const { data: activeSession, error: sessionError } = await supabaseAdmin
          .from("challenge_sessions")
          .select("*")
          .eq("user_id", auth.userId)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionError && sessionError.code !== "PGRST116") {
          console.error("Error fetching active session:", sessionError);
          return NextResponse.json({ error: "Failed to fetch active challenge" }, { status: 500 });
        }

        if (!activeSession) {
          return NextResponse.json({ 
            success: false, 
            reason: "no_active_challenge",
            message: "No active challenge session" 
          });
        }

        // Check if match was already processed for this challenge
        const { data: existingMatch } = await supabaseAdmin
          .from("challenge_sessions")
          .select("id")
          .eq("user_id", auth.userId)
          .contains("processed_matches", [match_id])
          .maybeSingle();

        if (existingMatch) {
          return NextResponse.json({ 
            success: false, 
            reason: "match_already_processed",
            message: "This match has already been processed for a challenge" 
          });
        }

        // Verify match timestamp is within challenge window
        const matchEndTime = game_end_timestamp ? new Date(game_end_timestamp) : new Date();
        const challengeStart = new Date(activeSession.started_at);
        const challengeEnd = new Date(activeSession.expires_at);

        if (matchEndTime < challengeStart || matchEndTime > challengeEnd) {
          return NextResponse.json({ 
            success: false, 
            reason: "match_outside_window",
            message: "Match was played outside the challenge time window" 
          });
        }

        // Validate champion meets challenge requirements
        let championValid = false;
        let validationReason = "";

        switch (activeSession.challenge_type) {
          case "low_mastery": {
            const threshold = activeSession.challenge_config?.low_mastery?.mastery_threshold || 10000;
            // Note: Actual mastery check would require fetching from Riot API
            // For now, we'll trust the frontend sent valid data, but in production
            // this should verify against actual mastery data
            validationReason = `Requires mastery < ${threshold}`;
            championValid = true; // Will be validated by separate mastery check
            break;
          }
          case "region": {
            const requiredRegion = activeSession.challenge_config?.region?.region;
            if (requiredRegion) {
              const { championHasRegion } = await import("@/lib/champion-metadata");
              championValid = championHasRegion(champion_name, requiredRegion);
              validationReason = `Requires champion from ${requiredRegion}`;
            }
            break;
          }
          case "class": {
            const requiredClass = activeSession.challenge_config?.class?.class;
            if (requiredClass) {
              const { championHasClass } = await import("@/lib/champion-metadata");
              championValid = championHasClass(champion_name, requiredClass);
              validationReason = `Requires ${requiredClass} champion`;
            }
            break;
          }
        }

        if (!championValid) {
          return NextResponse.json({ 
            success: false, 
            reason: "champion_invalid",
            message: `Champion does not meet challenge requirement: ${validationReason}` 
          });
        }

        // Check if won
        if (!won) {
          return NextResponse.json({ 
            success: false, 
            reason: "lost_match",
            message: "Challenge requires a victory" 
          });
        }

        // Calculate XP
        // Base XP for a win (this should match your existing XP system)
        const baseXp = 100; // Standard win XP
        const bonusXp = Math.floor(baseXp * (activeSession.xp_multiplier - 1));

        // Update challenge session
        const newValidWins = activeSession.valid_wins + 1;
        const newBonusXp = activeSession.bonus_xp + bonusXp;
        const newTotalBaseXp = activeSession.total_base_xp + baseXp;

        // Add processed match to prevent duplicates
        const processedMatches = (activeSession as any).processed_matches || [];
        processedMatches.push(match_id);

        const { data: updatedSession, error: updateError } = await supabaseAdmin
          .from("challenge_sessions")
          .update({
            valid_wins: newValidWins,
            bonus_xp: newBonusXp,
            total_base_xp: newTotalBaseXp,
            processed_matches: processedMatches,
            updated_at: new Date().toISOString()
          })
          .eq("id", activeSession.id)
          .eq("user_id", auth.userId)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating challenge session:", updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Award XP to user
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("xp, level")
          .eq("id", auth.userId)
          .single();

        if (user) {
          const totalXpGained = baseXp + bonusXp;
          const newXp = (user.xp || 0) + totalXpGained;
          const newLevel = calculateLevel(newXp);

          await supabaseAdmin
            .from("users")
            .update({ xp: newXp, level: newLevel })
            .eq("id", auth.userId);
        }

        return NextResponse.json({
          success: true,
          session: updatedSession,
          xpGained: {
            base: baseXp,
            bonus: bonusXp,
            total: baseXp + bonusXp
          }
        });
      }

      case "complete": {
        const { session_id } = body;
        
        const { data: session, error } = await supabaseAdmin
          .from("challenge_sessions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", session_id)
          .eq("user_id", auth.userId)
          .eq("status", "active")
          .select()
          .maybeSingle();

        if (error || !session) {
          return NextResponse.json({ error: "Challenge session not found or already completed" }, { status: 404 });
        }

        return NextResponse.json({ session });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Challenge sessions API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to get challenges by type
function getChallengesByType(type: string) {
  const { CHALLENGE_DEFINITIONS } = require("@/lib/challenge-definitions");
  return CHALLENGE_DEFINITIONS.filter((c: any) => c.type === type);
}