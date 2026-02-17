import mongoose, { Schema, Document } from "mongoose";

export interface IVenue extends Document {
    name: string;
    location: string;
    description?: string;
    capacity: number;
    openTime: string;
    closeTime: string;
    imageUrl?: string;
    createdAt: Date;
}

const VenueSchema: Schema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    capacity: { type: Number, default: 0 },
    openTime: { type: String, default: "09:00" },
    closeTime: { type: String, default: "22:00" },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export const VenueModel = mongoose.model<IVenue>("Venue", VenueSchema);
