import {Schema, model} from "mongoose";


const meetingSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        meetingCode: {
            type: String,
            required: true,
            unique: true,
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        }
    }
)

const Meeting = model("Meeting", meetingSchema);

export default Meeting;