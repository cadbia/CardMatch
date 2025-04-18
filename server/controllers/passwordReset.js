import Token from "../models/Token.js";
import sendEmail from "../utils/sendEmails.js";
import Joi from 'joi';
import User from "../models/User.js";
import crypto from 'crypto';

// @desc    Send password reset email
// @route   Post /api/passwordReset
// @access Public

//ask about the next part in cards.js getcards route, where its going
//also why am i sending error to next whats handling it
export const sendEmails = async(req, res, next)=>{
    try{
        console.log(req.body);
        //req body is the email??
        const schema = Joi.object({email: Joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if(error) return res.status(400).send(error.details[0].message);
        //or do i next the error??

        //so email : req.body.email makes sense the email shoud be in the body, but how
        //does this get the user sent to it and why does the schema.validate
        //only need req.body??
        const user = await User.findOne({email: req.body.email});
        if(!user)
            return res.status(400).send("user with given email doesn't exist");

        //research what this token does and why its needed/used
        let token = await Token.findOne({userId: user._id });
        if(!token){
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        //make sure the base_url i put in env makes sense
        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);


    }catch(error){
        next(error);
    }
};


// @desc    Reset Password
// @route   Post /api/passwordReset/:userId/:token
// @access Public

export const resetPass = async (req, res)=>{
    try{
        const schema = Joi.object({password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send("Invalid link or expired");

        const token = await TokenfindOne({
            userid: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");


        //does this password need to be de salted
        user.password = req.body.password;
        await user.save();
        await token.delete();
        //why deleting token?

        res.send("password reset sucessfully");


    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
};