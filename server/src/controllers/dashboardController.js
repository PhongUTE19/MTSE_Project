import * as dashboardService from "../services/dashboardService.js";

export async function getDashboardStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();
    if (!stats) return res.status(404).json({ error: "NotFound", message: "Dashboard statistics not found." });
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}
