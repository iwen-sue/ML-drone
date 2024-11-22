const Endpoint = require('../models/Endpoint');

const updateEndpoint = async (pathname, method) => {
    try {
        await Endpoint.findOneAndUpdate({ name: `${pathname}` }, { 
            $inc: { reqCount: 1 },
            $set: {
                name: `${pathname}`,
                method: `${method}`
              } 
            }, { upsert: true });
    } catch (error) {
        console.log(error);
    }
};

module.exports = { updateEndpoint };