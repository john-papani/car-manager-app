import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentVehicleProfile } from "@/lib/current-user-data";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import { getSheetCacheTag } from "@/lib/sheets";
import { getSessionOwnerId } from "@/lib/supabase";
import { getVehicleProfile, saveVehicleProfile } from "@/lib/supabase-data";
import {
  formatZodError,
  updateVehicleProfileSchema,
} from "@/lib/validation";
import type { VehicleProfile } from "@/types/car";

const CACHE_KEY = "vehicle_profile";
const PROFILE_ID = "vehicle-profile";

export async function GET() {
  try {
    const authResult = await requireSession();

    if (!authResult.ok) {
      return authResult.response;
    }

    const profile = await getCurrentVehicleProfile(authResult.session);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch vehicle profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireWritableSession("save vehicle changes");

    if (!authResult.ok) {
      return authResult.response;
    }

    const parsed = updateVehicleProfileSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const ownerId = getSessionOwnerId(authResult.session);
    const existingProfile = await getVehicleProfile(ownerId);
    const now = new Date().toISOString();

    const profile: VehicleProfile = {
      id: PROFILE_ID,
      make: body.make.trim(),
      model: body.model.trim(),
      trim: body.trim?.trim() || "",
      year: body.year,
      license_plate: body.license_plate?.trim().toUpperCase() || "",
      fuel_type: body.fuel_type?.trim() || "",
      transmission: body.transmission?.trim() || "",
      engine: body.engine?.trim() || "",
      color: body.color?.trim() || "",
      created_at: existingProfile?.created_at || now,
      updated_at: now,
    };

    await saveVehicleProfile(ownerId, profile);

    revalidateTag(getSheetCacheTag(CACHE_KEY), "max");
    revalidatePath("/");
    revalidatePath("/account");

    return NextResponse.json({ profile });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to save vehicle profile" },
      { status: 500 },
    );
  }
}
