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

exports.DateTimeGameExpiration = (expiration) => {
    const date = new Date();

    // Get the Unix timestamp in milliseconds
    const unixTimeMilliseconds = date.getTime();

    // Convert it to Unix timestamp in seconds
    const unixTimeSeconds = Math.floor(unixTimeMilliseconds / 1000);

    // Add number of expiration hours (expiration * 3600 seconds) to the Unix timestamp
    const newUnixTimeSeconds = unixTimeSeconds + (expiration * 3600);

    return newUnixTimeSeconds;
}

exports.DateTimeGameExpirationMinutes = (expiration) => {
    const date = new Date();

    // Get the Unix timestamp in milliseconds
    const unixTimeMilliseconds = date.getTime();

    // Convert it to Unix timestamp in seconds
    const unixTimeSeconds = Math.floor(unixTimeMilliseconds / 1000);

    // Add number of expiration minutes (expiration * 60 seconds) to the Unix timestamp
    const newUnixTimeSeconds = unixTimeSeconds + (expiration * 60);

    return newUnixTimeSeconds;
}

exports.CalculateSecondsBetween = (start, end) => {
    // Parse the input strings into Date objects
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Calculate the time difference in milliseconds
    const timeDiff = endTime - startTime;

    // Convert milliseconds to seconds
    const seconds = Math.floor(timeDiff / 1000);

    return seconds;
}

exports.UnixtimeToDateTime = (unixTimestamp) => {
    // Create a new Date object using the Unix timestamp multiplied by 1000
    const date = new Date(unixTimestamp * 1000);

    // Get individual components of the date
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    // Construct the formatted date and time string
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;

    return formattedDateTime;
}