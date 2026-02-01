import { Model,Document } from "mongoose";
import { IBaseRepository } from "@/interface/repository.interface";

export abstract class BaseRepository<T extends Document>implements IBaseRepository<T>{
   constructor(protected readonly model:Model<T>){}
   
   async create(item: Partial<T>): Promise<T> {
     return await this.model.create(item)
   }

   async findById(id: string): Promise<T | null> {
     return await this.model.findById(id);
   }

   async findOne(filter: object): Promise<T | null> {
     return await this.model.findOne(filter)
   }

   async updateById(id: string, updateData: Partial<T>): Promise<T | null> {
     return await this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true });
   }
}