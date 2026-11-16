import { Model, Types, QueryFilter, UpdateQuery, QueryOptions } from 'mongoose';

export abstract class AbstractRepository<T> {
    constructor(protected readonly model: Model<T>) {}

    getModel(): Model<T> {
        return this.model;
    }

    async create(data: Partial<T> | any) {
        return this.model.create(data);
    }

    async findById(id: string | Types.ObjectId, projection?: any) {
        return this.model.findById(id, projection);
    }

    async findOne(filter: QueryFilter<T>, projection?: any) {
        return this.model.findOne(filter, projection);
    }

    async find(filter: QueryFilter<T> = {}, projection?: any, options?: QueryOptions<T>) {
        return this.model.find(filter, projection, options);
    }

    async update(
        filter: QueryFilter<T>,
        newData: UpdateQuery<T> | Partial<T>,
        options: QueryOptions<T> = { new: true }
    ) {
        return this.model.findOneAndUpdate(filter, newData, options);
    }

    async updateById(
        id: string | Types.ObjectId,
        newData: UpdateQuery<T> | Partial<T>,
        options: QueryOptions<T> = { new: true }
    ) {
        return this.model.findByIdAndUpdate(id, newData, options);
    }

    async delete(id: string | Types.ObjectId) {
        return this.model.deleteOne({ _id: id } as any);
    }

    async deleteOne(filter: QueryFilter<T>) {
        return this.model.deleteOne(filter);
    }

    async deleteMany(filter: QueryFilter<T>) {
        return this.model.deleteMany(filter);
    }

    async countDocuments(filter: QueryFilter<T> = {}): Promise<number> {
        return this.model.countDocuments(filter);
    }

    async exists(filter: QueryFilter<T>) {
        return this.model.exists(filter);
    }
}
