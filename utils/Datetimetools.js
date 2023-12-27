const DateTimeServer = () => {
    const date = new Date();
    
    const GetUnixtime = () => {
        // Get the Unix timestamp in milliseconds
        const unixTimeMilliseconds = date.getTime();
        
        // Convert it to Unix timestamp in seconds
        const unixTimeSeconds = Math.floor(unixTimeMilliseconds / 1000);
        
        return unixTimeSeconds;
    }

    return { GetUnixtime }
}