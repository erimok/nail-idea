class AIPasrseError extends Error {
    constructor(message: string = 'Error parsing prompt') {
        super(message);
        this.name = 'AIPasrseError';
    }
}

export { AIPasrseError };