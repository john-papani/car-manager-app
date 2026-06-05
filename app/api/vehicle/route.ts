import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { getCurrentVehicleProfile } from "@/lib/current-user-data";
import { getDemoReadOnlyMessage, isDemoSession } from "@/lib/demo-mode";
import { getCachedRows, getSheetCacheTag, upsertRowById } from "@/lib/sheets";
import {
  isVehicleProfileValid,
  mapRowToVehicleProfile,
} from "@/lib/vehicle-profile";
import type { UpdateVehicleProfileInput, VehicleProfile } from "@/types/car";

const SHEET_NAME = "vehicle_profile";
const PROFILE_ID = "vehicle-profile";

export async function GET() {
  try {
    const profile = await getCurrentVehicleProfile();

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
    const session = await auth();

    if (isDemoSession(session)) {
      return NextResponse.json(
        { message: getDemoReadOnlyMessage("save vehicle changes") },
        { status: 403 },
      );
    }

    const body = (await request.json()) as UpdateVehicleProfileInput;

    if (!body.make?.trim() || !body.model?.trim()) {
      return NextResponse.json(
        { message: "Make and model are required" },
        { status: 400 },
      );
    }

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
      year:
        body.year && Number.isFinite(Number(body.year))
          ? Number(body.year)
          : undefined,
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
