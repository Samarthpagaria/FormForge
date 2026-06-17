import { NextResponse } from "next/server";
import openApiSpec from "../../../public/openapi.json";

export function GET() {
  return NextResponse.json(openApiSpec);
}
