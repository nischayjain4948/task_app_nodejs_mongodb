
const sendGM = require("@sendgrid/mail");
;
sendGM.setApiKey(process.env.SEND_GRID_API_KEY);


const sendEmail =  (email, name) => {
sendGM.send({
    to:email,
    from:"nischayjain4948@gmail.com",
    subject:"Hello from deshpremii",
    text:`hello, ${name} this is a great mentor from our side `
})

}
module.exports = {sendEmail};