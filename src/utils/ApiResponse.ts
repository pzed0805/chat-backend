export class ApiResponse<T> {
    public success: boolean;
    public message: string;
    public data: T | null;

    constructor(
        message: string,
        data: T | null = null
    ) {
        this.success = true;
        this.message = message;
        this.data = data;
    }
}