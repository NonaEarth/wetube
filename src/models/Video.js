import mongoose from "mongoose";

//{} Setting and exporting a function.
// export const formatHashtags = function (hashtags) {
//     return (hashtags.split(",").map((word) =>
//     word.startsWith('#') ? word : `#${word}`));
// }

const videoSchema = new mongoose.Schema({
    // title: { type: String} 과 동일
    title: { type: String, required: true, uppercase: false, trim: true, maxLength: 20 },
    fileUrl: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    description: { type: String, required: true, minLength: 5 },
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
        rating: { type: Number, default: 0, required: true },
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" }],
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

//{} Setting a middleware to format hashtags.
// videoSchema.pre("save", async function () {

//     this.hashtags = this.hashtags[0].split(",").map((word) =>
//         word.startsWith('#') ? word : `#${word}`);
// })

videoSchema.static('formatHashtags', function (hashtags) {
    return (hashtags.split(",").map((word) =>
        word.startsWith('#') ? word : `#${word}`));
});

const videoModel = mongoose.model("Video", videoSchema);

export default videoModel;