import { Request } from "express"

export class GuestCartHelper {
  /**
   * Get guest ID from header (frontend gửi qua X-Guest-ID)
   */
  getGuestId(req: Request): string | null {
    const guestId = req.headers["x-guest-id"] as string

    if (!guestId || !this.isGuestId(guestId)) {
      return null
    }

    // Validate format
    if (!this.isValidGuestId(guestId)) {
      console.warn(`⚠️ Invalid guest ID format: ${guestId}`)
      return null
    }

    return guestId
  }

  /**
   * Check if ID is guest
   */
  isGuestId(id: string): boolean {
    return Boolean(id && id.startsWith("guest_"))
  }

  /**
   * Validate guest ID format
   */
  isValidGuestId(id: string): boolean {
    // Format: guest_uuid (guest_ + 36 chars uuid)
    const pattern = /^guest_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return pattern.test(id)
  }
}

export const guestCartHelper = new GuestCartHelper()
