import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text)=>{
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: process.env.PORT || 3000,
            source: true,
            auth: {
                //get correct auth
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email was sent successfully");
    }catch(error){
        console.log(error, "email not sent");
    }
};

export default sendEmail;