export interface IStorageProvider{
    uploadFile(file: File, path: string): Promise<void>
    getPublicUrl(path:string):string
}