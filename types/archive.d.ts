declare function handler(event: any, context: any): Promise<{
    statusCode: number;
    body: string;
}>;
export function parseM3UFile(fileContents: any): {
    uri: string;
    title: any;
}[];
export function getMP3URLs(playlistItems: any): any;
export { handler as lambdaHandler };
