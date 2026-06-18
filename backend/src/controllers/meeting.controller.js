import Meeting from "../models/meeting.model.js";
import httpStatus from "http-status";

export const add_to_activity = async (req, res) => {
  const userId = req.user; 
  const meetingCode = req.body.meeting_code || req.body.meetingCode;

  if (!meetingCode) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Meeting ID/Code is required" });
  }

  try {
    const meeting = await Meeting.findOne({ userId, meetingCode });
    
    if (meeting) {
      meeting.date = Date.now();
      await meeting.save();
      return res
        .status(httpStatus.OK)
        .json({ message: "Meeting rejoined", meeting });
    } else {
      const newMeeting = new Meeting({
        userId,
        meetingCode,
        date: Date.now(),
      });
      await newMeeting.save();
      return res
        .status(httpStatus.CREATED)
        .json({ message: "Meeting created and joined", meeting: newMeeting });
    }
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error adding activity", error: error.message });
  }
};

export const get_all_activity = async (req, res) => {
  const userId = req.user;

  try {
    const meetings = await Meeting.find({ userId }).sort({ date: -1 });

    return res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error getting all activity", error: error.message });
  }
};