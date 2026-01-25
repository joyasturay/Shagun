import { v4 as uuidv4 } from "uuid"
import { IStorageProvider } from "../interfaces/IStorageProvider"


export class EnvelopeService{
    constructor(private storageProvider: IStorageProvider) { }
    async uploadEnvelope(file: File): Promise<string>{
        const filename = `${uuidv4()}-${file.name}`
        await this.storageProvider.uploadFile(file, filename)
        const url = this.storageProvider.getPublicUrl(filename)
        return url
    }
}