import * as memberService from "../services/memberService.js";

export async function getMembersByProject(req, res, next) {
  try {
    const members = await memberService.getMembers(req.params.projectId);
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
}

export async function createMember(req, res, next) {
  try {
    const member = await memberService.createMember(req.params.projectId, req.body);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
}

export async function updateMember(req, res, next) {
  try {
    const member = await memberService.updateMember(
      req.params.projectId,
      req.params.id,
      req.body
    );
    if (!member) {
      return res.status(404).json({
        error: "NotFound",
        message: `Member with ID "${req.params.id}" not found in project "${req.params.projectId}".`,
      });
    }
    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
}

export async function deleteMember(req, res, next) {
  try {
    const result = await memberService.deleteMember(req.params.projectId, req.params.id);
    if (!result) {
      return res.status(404).json({
        error: "NotFound",
        message: `Member with ID "${req.params.id}" not found in project "${req.params.projectId}".`,
      });
    }
    res.status(200).json({
      success: true,
      deletedId: result.deletedId,
      message: "Member successfully deleted.",
    });
  } catch (error) {
    next(error);
  }
}
