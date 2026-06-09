"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getClientIpFromHeaders } from "@/lib/get-client-ip";
import {
  checkRateLimit,
  getRateLimitMessage,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import {
  INVITE_CODE_LENGTH,
  INVITE_CODE_PATTERN,
  type LeagueFormState,
} from "@/types/league";
import { createClient } from "@/utils/supabase/server";

const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode(): string {
  let code = "";
  for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
    const charIndex = Math.floor(Math.random() * INVITE_CODE_CHARS.length);
    code += INVITE_CODE_CHARS[charIndex];
  }
  return code;
}

async function createUniqueInviteCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const inviteCode = generateInviteCode();
    const { data } = await supabase
      .from("leagues")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (!data) {
      return inviteCode;
    }
  }

  return null;
}

function validateLeagueName(name: string): string | null {
  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return "Nazwa ligi musi mieć co najmniej 2 znaki.";
  }

  if (trimmed.length > 60) {
    return "Nazwa ligi może mieć maksymalnie 60 znaków.";
  }

  return null;
}

function validateInviteCode(inviteCode: string): string | null {
  const normalized = inviteCode.trim().toUpperCase();

  if (normalized.length !== INVITE_CODE_LENGTH) {
    return `Kod musi składać się z ${INVITE_CODE_LENGTH} znaków.`;
  }

  if (!INVITE_CODE_PATTERN.test(normalized)) {
    return "Kod może zawierać tylko litery i cyfry.";
  }

  return null;
}

// Mapuje surowe błędy bazy na bezpieczne komunikaty dla użytkownika.
// Pełny komunikat trafia do logów serwera (console.error w miejscu wywołania),
// nigdy do UI — żeby nie ujawniać struktury backendu.
function mapLeagueActionError(message: string): string {
  if (message.includes("violates foreign key constraint")) {
    return "Twoja sesja jest nieaktualna. Wyloguj się i zaloguj ponownie.";
  }

  if (message.includes("duplicate key")) {
    return "Konflikt kodu zaproszenia. Spróbuj ponownie.";
  }

  return "Nie udało się utworzyć ligi. Spróbuj ponownie.";
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/leagues");
  }

  return { supabase, user };
}

export async function createLeague(
  prevState: LeagueFormState,
  formData: FormData,
): Promise<LeagueFormState> {
  const name = String(formData.get("name") ?? "");
  const nameError = validateLeagueName(name);

  if (nameError) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: { name: nameError },
    };
  }

  const { supabase, user } = await requireAuthenticatedUser();
  const inviteCode = await createUniqueInviteCode(supabase);

  if (!inviteCode) {
    return {
      status: "error",
      message: "Nie udało się wygenerować kodu zaproszenia. Spróbuj ponownie.",
    };
  }

  const leagueId = randomUUID();

  const { error: leagueError } = await supabase.from("leagues").insert({
    id: leagueId,
    name: name.trim(),
    invite_code: inviteCode,
    created_by: user.id,
  });

  if (leagueError) {
    console.error("[createLeague] insert:", leagueError.message, leagueError);
    return {
      status: "error",
      message: mapLeagueActionError(leagueError.message),
    };
  }

  const { error: memberError } = await supabase.from("league_members").insert({
    league_id: leagueId,
    user_id: user.id,
  });

  if (memberError) {
    console.error("[createLeague] member insert:", memberError.message, memberError);
    return {
      status: "error",
      message: mapLeagueActionError(memberError.message),
    };
  }

  revalidatePath("/leagues");
  revalidatePath(`/leagues/${leagueId}`);
  redirect(`/leagues/${leagueId}`);
}

export async function joinLeague(
  prevState: LeagueFormState,
  formData: FormData,
): Promise<LeagueFormState> {
  const inviteCodeInput = String(formData.get("inviteCode") ?? "");
  const inviteCodeError = validateInviteCode(inviteCodeInput);

  if (inviteCodeError) {
    return {
      status: "error",
      message: "Popraw błędy w formularzu.",
      fieldErrors: { inviteCode: inviteCodeError },
    };
  }

  const normalizedCode = inviteCodeInput.trim().toUpperCase();
  const { supabase, user } = await requireAuthenticatedUser();

  const inviteLookupRateLimit = checkRateLimit(
    "invite-code-lookup",
    await getClientIpFromHeaders(),
    RATE_LIMITS.inviteCodeLookup,
  );
  if (!inviteLookupRateLimit.allowed) {
    return {
      status: "error",
      message: getRateLimitMessage(inviteLookupRateLimit),
    };
  }

  const { data: leagueId, error: lookupError } = await supabase.rpc(
    "find_league_id_by_invite_code",
    { p_code: normalizedCode },
  );

  if (lookupError) {
    console.error("[joinLeague] lookup:", lookupError.message);
    return {
      status: "error",
      message: "Nie udało się zweryfikować kodu. Spróbuj ponownie.",
    };
  }

  if (!leagueId) {
    return {
      status: "error",
      message: "Nieprawidłowy kod.",
      fieldErrors: { inviteCode: "Nie znaleziono ligi z tym kodem." },
    };
  }

  const { data: existingMembership } = await supabase
    .from("league_members")
    .select("league_id")
    .eq("league_id", leagueId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership) {
    return {
      status: "error",
      message: "Już jesteś w tej lidze.",
    };
  }

  const { error: joinError } = await supabase.from("league_members").insert({
    league_id: leagueId,
    user_id: user.id,
  });

  if (joinError) {
    console.error("[joinLeague] insert:", joinError.message);
    return {
      status: "error",
      message: "Nie udało się dołączyć do ligi. Spróbuj ponownie.",
    };
  }

  revalidatePath("/leagues");
  revalidatePath(`/leagues/${leagueId}`);
  redirect(`/leagues/${leagueId}`);
}
