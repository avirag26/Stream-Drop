export interface IBaseRepository<T> {
    create(item: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filter: object): Promise<T | null>;
}