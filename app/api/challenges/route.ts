import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAuth } from "@/lib/verify-jwt";
import { ACHIEVEMENTS, calculateLevel, checkAchievement } from "@/lib/achievements";

const RIOT_API_KEY = process.env.RIOT_API_KEY!;
const VALID_LANES = new Set(["all", "top", "jungle", "mid", "adc", "support"]);

type MatchVerification = {
  success: boolean;
  playedCorrectChampion: boolean;
  won: boolean;
  championPlayed: string;
  championIdExpected: number;
  championIdPlayed: number;
  matchId: string;
  gameMode: string;
  gameDuration: number;
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    gold: number;
  };
};

function getPlatformRegion(region: string): string {
  const mapping: Record<string, string> = {
    br1: "americas",
    eun1: "europe",
    euw1: "europe",
    jp1: "asia",
    kr: "asia",
    la1: "americas",
    la2: "americas",
    na1: "americas",
    oc1: "sea",
    ph2: "sea",
    ru: "europe",
    sg2: "sea",
    th2: "sea",
    tr1: "europe",
    tw2: "sea",
    vn2: "sea",
  };

  return mapping[region.toLowerCase()] || "europe";
}

async function verifyMatchWithRiot(params: {
  puuid: string;
  region: string;
  championId: number;
  challengeCreatedAt: string;
  expectedMatchId?: string;
}): Promise<MatchVerification | null> {
  if (!RIOT_API_KEY) {
    throw new Error("RIOT_API_KEY is not configured");
  }

  const platformRegion = getPlatformRegion(params.region);
  const matchesRes = await fetch(
    `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${params.puuid}/ids?start=0&count=5`,
    {
      headers: { "X-Riot-Token": RIOT_API_KEY },
      next: { revalidate: 0 },
    }
  );

  if (!matchesRes.ok) {
    throw new Error("Failed to fetch matches from Riot");
  }

  const matchIds: string[] = await matchesRes.json();
  const challengeCreatedAtMs = Date.parse(params.challengeCreatedAt);

  for (const matchId of matchIds) {
    if (params.expectedMatchId && matchId !== params.expectedMatchId) continue;

    const matchRes = await fetch(
      `https://${platformRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: { "X-Riot-Token": RIOT_API_KEY },
        next: { revalidate: 0 },
      }
    );

    if (!matchRes.ok) continue;

    const match = await matchRes.json();
    const matchEndMs = match.info?.gameEndTimestamp ?? match.info?.gameCreation;
    if (typeof matchEndMs === "number" && matchEndMs <= challengeCreatedAtMs) continue;

    const participant = match.info?.participants?.find((p: any) => p.puuid === params.puuid);
    if (!participant) continue;

    const expectedChampId = Number(params.championId);
    const playedChampId = Number(participant.championId);
    const playedCorrectChampion = playedChampId === expectedChampId;
    const won = Boolean(participant.win);

    return {
      success: playedCorrectChampion && won,
      playedCorrectChampion,
      won,
      championPlayed: participant.championName,
      championIdExpected: expectedChampId,
      championIdPlayed: playedChampId,
      matchId,
      gameMode: match.info.gameMode,
      gameDuration: match.info.gameDuration,
      stats: {
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        gold: participant.goldEarned,
      },
    };
  }

  return null;
}

async function unlockEligibleAchievements(user: any, stats: {
  currentStreak: number;
  totalChallenges: number;
  level: number;
}) {
  const { data: existingAchievements } = await supabaseAdmin
    .from("achievements")
    .select("achievement_type")
    .eq("user_id", user.id);

  const existingTypes = new Set((existingAchievements || []).map((a: any) => a.achievement_type));
  const unlocked = [];

  for (const [type, achievement] of Object.entries(ACHIEVEMENTS)) {
    if (existingTypes.has(type)) continue;
    if (!checkAchievement(type as any, stats)) continue;

    const { data, error } = await supabaseAdmin
      .from("achievements")
      .insert([{
        user_id: user.id,
        achievement_type: type,
        achievement_name: achievement.name,
        achievement_description: achievement.description,
      }])
      .select()
      .single();

    if (!error && data) {
      unlocked.push({ ...data, xpReward: achievement.xpReward });
    }
  }

  return unlocked;
}

export async function GET(request: Request) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("challenges")
    .select("*")
    .eq("user_id", auth.userId);

  return NextResponse.json({ data });
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
      case "create": {
        const { champion_id, champion_name, lane, reroll_count } = body;
        if (!champion_id || !champion_name || !VALID_LANES.has(lane)) {
          return NextResponse.json({ error: "Invalid challenge data" }, { status: 400 });
        }

        const { data: pendingChallenge } = await supabaseAdmin
          .from("challenges")
          .select("*")
          .eq("user_id", auth.userId)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pendingChallenge) {
          return NextResponse.json({ challenge: pendingChallenge });
        }

        const { data, error } = await supabaseAdmin
          .from("challenges")
          .insert([{
            user_id: auth.userId,
            champion_id: String(champion_id),
            champion_name,
            lane,
            status: "pending",
            xp_reward: 100,
            reroll_count: Math.max(0, Number(reroll_count) || 0),
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating challenge:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ challenge: data });
      }

      case "reroll": {
        const { challenge_id, champion_id, champion_name, lane, reroll_count } = body;
        if (!challenge_id || !champion_id || !champion_name || !VALID_LANES.has(lane)) {
          return NextResponse.json({ error: "Invalid challenge data" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
          .from("challenges")
          .update({
            champion_id: String(champion_id),
            champion_name,
            lane,
            created_at: new Date().toISOString(),
            reroll_count: Math.max(0, Number(reroll_count) || 0),
          })
          .eq("id", challenge_id)
          .eq("user_id", auth.userId)
          .eq("status", "pending")
          .select()
          .single();

        if (error) {
          console.error("Error updating challenge:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ challenge: data });
      }

      case "complete": {
        return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });
      }

      case "complete_by_id": {
        const { challenge_id, match_id } = body;
        if (!challenge_id) {
          return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });
        }

        const { data: challenge, error: challengeError } = await supabaseAdmin
          .from("challenges")
          .select("*")
          .eq("id", challenge_id)
          .eq("user_id", auth.userId)
          .eq("status", "pending")
          .single();

        if (challengeError || !challenge) {
          return NextResponse.json({ error: "Pending challenge not found" }, { status: 404 });
        }

        const { data: user, error: userError } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", auth.userId)
          .single();

        if (userError || !user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const verification = await verifyMatchWithRiot({
          puuid: user.puuid || auth.puuid,
          region: user.region || auth.region || "euw1",
          championId: Number(challenge.champion_id),
          challengeCreatedAt: challenge.created_at,
          expectedMatchId: match_id,
        });

        if (!verification) {
          return NextResponse.json({ error: "No verified match found for this challenge" }, { status: 404 });
        }

        const { data: previousMatch } = await supabaseAdmin
          .from("challenges")
          .select("id")
          .eq("user_id", auth.userId)
          .eq("match_id", verification.matchId)
          .neq("id", challenge_id)
          .maybeSingle();

        if (previousMatch) {
          return NextResponse.json({ error: "Match already used for another challenge" }, { status: 409 });
        }

        if (!verification.success) {
          await supabaseAdmin
            .from("challenges")
            .update({
              status: "failed",
              completed_at: new Date().toISOString(),
              match_id: verification.matchId,
              match_data: verification.stats,
            })
            .eq("id", challenge_id)
            .eq("user_id", auth.userId)
            .eq("status", "pending");

          const { data: updatedUser } = await supabaseAdmin
            .from("users")
            .update({ current_streak: 0 })
            .eq("id", auth.userId)
            .select()
            .single();

          return NextResponse.json({ success: false, verification, user: updatedUser });
        }

        const challengeXp = Number(challenge.xp_reward) || 100;
        const baseXp = Number(user.xp) + challengeXp;
        const newStreak = Number(user.current_streak) + 1;
        const newTotalChallenges = Number(user.total_challenges_completed) + 1;
        const baseLevel = calculateLevel(baseXp);

        const unlockedAchievements = await unlockEligibleAchievements(user, {
          currentStreak: newStreak,
          totalChallenges: newTotalChallenges,
          level: baseLevel,
        });

        const bonusXp = unlockedAchievements.reduce((total, achievement) => total + achievement.xpReward, 0);
        const finalXp = baseXp + bonusXp;
        const finalLevel = calculateLevel(finalXp);

        const { data: completedChallenge, error: completeError } = await supabaseAdmin
          .from("challenges")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            match_id: verification.matchId,
            match_data: verification.stats,
          })
          .eq("id", challenge_id)
          .eq("user_id", auth.userId)
          .eq("status", "pending")
          .select()
          .single();

        if (completeError) {
          console.error("Error completing challenge:", completeError);
          return NextResponse.json({ error: completeError.message }, { status: 500 });
        }

        const { data: updatedUser, error: updateUserError } = await supabaseAdmin
          .from("users")
          .update({
            xp: finalXp,
            level: finalLevel,
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, Number(user.longest_streak)),
            total_challenges_completed: newTotalChallenges,
          })
          .eq("id", auth.userId)
          .select()
          .single();

        if (updateUserError) {
          console.error("Error updating user stats:", updateUserError);
          return NextResponse.json({ error: updateUserError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          challenge: completedChallenge,
          user: updatedUser,
          verification,
          achievements: unlockedAchievements,
        });
      }

      case "fail": {
        const { challenge_id, match_id, match_data } = body;
        if (!challenge_id) {
          return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
          .from("challenges")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            match_id,
            match_data,
          })
          .eq("id", challenge_id)
          .eq("user_id", auth.userId)
          .eq("status", "pending");

        if (error) {
          console.error("Error failing challenge:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await supabaseAdmin
          .from("users")
          .update({ current_streak: 0 })
          .eq("id", auth.userId);

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Challenges API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
