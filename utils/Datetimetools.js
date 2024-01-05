exports.DateTimeServer = () => {
    const date = new Date();
    
    // Get the Unix timestamp in milliseconds
    const unixTimeMilliseconds = date.getTime();
        
    // Convert it to Unix timestamp in seconds
    const unixTimeSeconds = Math.floor(unixTimeMilliseconds / 1000);
    
    return unixTimeSeconds;
}

exports.DateTimeServerExpiration = (expiration) => {
    const date = new Date();

    // Get the Unix timestamp in milliseconds
    const unixTimeMilliseconds = date.getTime();

    // Convert it to Unix timestamp in seconds
    const unixTimeSeconds = Math.floor(unixTimeMilliseconds / 1000);

    // Add 30 days (30 * 24 * 60 * 60 seconds) to the current timestamp
    const unixTimeSecondsIn30Days = unixTimeSeconds + (expiration * 24 * 60 * 60);

    return unixTimeSecondsIn30Days;
}