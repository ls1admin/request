import type { APIRequestContext } from "@playwright/test";
import { SERVER_URL } from "../playwright.config";

export interface DebugTicket {
  ticket_key: string;
  summary: string;
  description: string;
  reporter_username: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  issue_type: string;
  comments: string[];
  custom_fields: Array<{ field: string; value: unknown }>;
}

export async function getLatestTicket(
  request: APIRequestContext,
): Promise<DebugTicket> {
  const response = await request.get(
    `${SERVER_URL}/api/v1/debug/tickets/latest`,
  );
  if (!response.ok()) {
    throw new Error(
      `Failed to get latest ticket: ${response.status()} ${await response.text()}`,
    );
  }
  return response.json();
}

export async function getAllTickets(
  request: APIRequestContext,
): Promise<DebugTicket[]> {
  const response = await request.get(`${SERVER_URL}/api/v1/debug/tickets`);
  if (!response.ok()) {
    throw new Error(
      `Failed to get tickets: ${response.status()} ${await response.text()}`,
    );
  }
  return response.json();
}

export async function clearTickets(
  request: APIRequestContext,
): Promise<void> {
  const response = await request.delete(
    `${SERVER_URL}/api/v1/debug/tickets`,
  );
  if (!response.ok()) {
    throw new Error(
      `Failed to clear tickets: ${response.status()} ${await response.text()}`,
    );
  }
}

export async function clearDatabase(
  request: APIRequestContext,
): Promise<void> {
  const response = await request.delete(`${SERVER_URL}/api/v1/debug/db`);
  if (!response.ok()) {
    throw new Error(
      `Failed to clear database: ${response.status()} ${await response.text()}`,
    );
  }
}

export async function resetTestState(
  request: APIRequestContext,
): Promise<void> {
  await clearTickets(request);
  await clearDatabase(request);
}
