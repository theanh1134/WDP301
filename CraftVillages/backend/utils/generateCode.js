const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateExpirationTime = (minutes = 3) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = {
    generateCode,
    generateExpirationTime
};

