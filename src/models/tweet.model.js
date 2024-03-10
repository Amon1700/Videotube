import mongoose,{Schema} from "mongoose";


const tweetSchemma = new Schema(
    {
        content: {
            type: String,
            required: true,

        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)


export const Tweet = mongoose.model("Tweet", tweetSchemma)