export interface IRoute{
    url: string,
    controller(): void,
    authorization: boolean
}