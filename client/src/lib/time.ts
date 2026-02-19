export function isVenueOpen(openTime: string, closeTime: string): boolean {
    const now = new Date()

    const [openHour, openMinute] = openTime.split(":").map(Number)
    const [closeHour, closeMinute] = closeTime.split(":").map(Number)

    const open = new Date(now)
    open.setHours(openHour, openMinute, 0, 0)

    const close = new Date(now)
    close.setHours(closeHour, closeMinute, 0, 0)

    // Case 1: Normal same-day closing (09:00 → 18:00)
    if (close > open) {
        return now >= open && now <= close
    }

    // Case 2: Overnight (18:00 → 02:00)
    return now >= open || now <= close
}
