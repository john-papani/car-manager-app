import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentVehicleProfile } from "@/lib/current-user-data";
import { requireSession, requireWritableSession } from "@/lib/require-session";
import { getCachedRows, getSheetCacheTag, upsertRowById } from "@/lib/sheets";
import {
  isVehicleProfileValid,
  mapRowToVehicleProfile,
} from "@/lib/vehicle-profile";
import {
  formatZodError,
  updateVehicleProfileSchema,
} from "@/lib/validation";
import type { VehicleProfile } from "@/types/car";

const SHEET_NAME = "vehicle_profile";
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
    const existingRows = await getCachedRows(SHEET_NAME);
    const existingProfile =
      existingRows
        .map(mapRowToVehicleProfile)
        .filter(isVehicleProfileValid)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null;
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

    await upsertRowById(SHEET_NAME, PROFILE_ID, [
      profile.id,
      profile.make,
      profile.model,
      profile.trim || "",
      profile.year ?? "",
      profile.license_plate || "",
      profile.fuel_type || "",
      profile.transmission || "",
      profile.engine || "",
      profile.color || "",
      profile.created_at,
      profile.updated_at,
    ]);

    revalidateTag(getSheetCacheTag(SHEET_NAME), "max");
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
