import { describe, expect, it } from "vitest";
import { contactSchema } from "./formSchemas";

describe("contactSchema", () => {
  it("accepts valid contact form values", async () => {
    await expect(
      contactSchema.validate({
        name: "Asha Rao",
        email: "asha@example.com",
        phone: "+91 98765 43210",
        company: "Jaimax",
        status: "Lead",
        notes: "Interested in CRM",
      }),
    ).resolves.toMatchObject({
      email: "asha@example.com",
      status: "Lead",
    });
  });

  it("rejects invalid status", async () => {
    await expect(
      contactSchema.validate({
        name: "Asha Rao",
        email: "asha@example.com",
        phone: "+91 98765 43210",
        company: "Jaimax",
        status: "Cold",
      }),
    ).rejects.toThrow("Choose a valid status");
  });
});
