//Enabling Cors
const corsFunction = function (req, res, next) {
    //const allowedOrigins = ["https://test-ui.tangentmotorsport.com"];
   // const allowedOrigins = ["*"];
   // const reqOrigin = req.get("origin");
    // if (allowedOrigins.find((origin) => origin === reqOrigin)) {
    //     res.header("Access-Control-Allow-Origin", reqOrigin);
    // }
    res.header("Access-Control-Allow-Origin","*");

    res.header("Access-Control-Allow-Credentials", true);
    res.header(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT,PATCH,OPTIONS,DELETE"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,authorization"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
};

module.exports = corsFunction;
