const Activity = require("../models/Activity");

module.exports = async function logActivity({
  action,
  mobile,
  SoldMobile,
  user
}) {
  try {
    const now = new Date();
    const dateOnly = now.toISOString().slice(0, 10); // YYYY-MM-DD

    await Activity.create({
      action,

      mobileRef: mobile?._id,
      soldMobileRef: SoldMobile?._id,

      make: mobile?.make || SoldMobile?.make,
      model: mobile?.model || SoldMobile?.model,
      storage: mobile?.storage || SoldMobile?.storage,
      ram: mobile?.ram || SoldMobile?.ram,
      color: mobile?.color || SoldMobile?.color,
      imei1: mobile?.imei1 || SoldMobile?.imei1,

      user: user
        ? { id: user.id, role: user.role }
        : undefined,

      createdAt: now,
      activityDate: dateOnly
    });
  } catch (err) {
    console.error("❌ Activity log failed:", err.message);
  }
};
